import { SYMPTOM_SYSTEM } from "./prompts";
import { getLlmProvider, llmChat, parseJsonObject } from "./llm";
import { componentFromText, type KundliContext } from "./reading";
import { COMPONENT_OPTIONS } from "@/lib/constants/components";
import type { Frequency, Severity } from "@/lib/types";

// Note-first symptoms: the rider writes what they noticed; we deduce the
// component, severity, frequency, a short title, and the likely upcoming
// problem from the model's known issues.

export type SymptomDeduction = {
  component: string;
  severity: Severity;
  frequency: Frequency;
  title: string;
  predicted_issue: string | null;
};

const HIGH = /stall|cut ?off|cuts out|brake (?:fail|not|gone)|no brake|smoke|overheat|seiz|lock(?:ed)? up|wobble|tank slap|fuel leak|petrol smell|won'?t start|not starting/i;
const MEDIUM = /noise|noisy|weak|slow|slip|jerk|vibrat|rattle|hard|stiff|drag|pull|misfir|rough|knock|drop|dim|flicker|hesitat/i;
const CONSTANT = /always|every time|constant|whenever|har baar|hamesha/i;
const FREQUENT = /often|frequent|most days|daily|regular/i;
const INTERMITTENT = /sometimes|occasionally|intermittent|now and then|kabhi/i;

export async function deduceSymptom(note: string, ctx: KundliContext): Promise<SymptomDeduction> {
  let deduced: Partial<SymptomDeduction> | null = null;

  if (getLlmProvider() !== "rules") {
    const raw = await llmChat({ system: SYMPTOM_SYSTEM, turns: [{ role: "user", content: note }], json: true, maxTokens: 200 });
    const parsed = parseJsonObject<Record<string, unknown>>(raw);
    if (parsed) {
      const component = typeof parsed.component === "string" && (COMPONENT_OPTIONS as readonly string[]).includes(parsed.component) ? parsed.component : undefined;
      const severity = typeof parsed.severity === "string" && ["low", "medium", "high", "critical"].includes(parsed.severity) ? (parsed.severity as Severity) : undefined;
      const frequency = typeof parsed.frequency === "string" && ["once", "intermittent", "frequent", "constant"].includes(parsed.frequency) ? (parsed.frequency as Frequency) : undefined;
      const title = typeof parsed.title === "string" && parsed.title.trim() ? parsed.title.trim().slice(0, 80) : undefined;
      deduced = { component, severity, frequency, title };
    }
  }

  const component = deduced?.component ?? componentFromText(note) ?? "General Ownership";
  const severity: Severity = deduced?.severity ?? (HIGH.test(note) ? "high" : MEDIUM.test(note) ? "medium" : "low");
  const frequency: Frequency = deduced?.frequency ?? (CONSTANT.test(note) ? "constant" : FREQUENT.test(note) ? "frequent" : INTERMITTENT.test(note) ? "intermittent" : "once");
  const title = deduced?.title ?? titleFrom(note);

  return { component, severity, frequency, title, predicted_issue: predictIssue(component, note, ctx) };
}

function titleFrom(note: string) {
  const words = note.replace(/\s+/g, " ").trim().split(" ").slice(0, 7).join(" ");
  const clean = words.replace(/[.,;:!?]+$/, "");
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

// The most relevant known issue for this component on this model: prefer one
// whose checkpoint is near the bike's km, then the most-mentioned.
function predictIssue(component: string, note: string, ctx: KundliContext): string | null {
  const odo = ctx.bike?.odometer_km ?? 0;
  const lower = note.toLowerCase();
  const candidates = ctx.knownIssues.filter((issue) => issue.component === component);
  if (!candidates.length) return null;
  const scored = candidates
    .map((issue) => {
      let score = issue.mention_count;
      if (issue.service_checkpoint_km && Math.abs(issue.service_checkpoint_km - odo) <= 4000) score += 40;
      const watch = (issue.symptoms_to_watch ?? "").toLowerCase();
      const overlap = watch.split(/[\s,;]+/).filter((w) => w.length > 4 && lower.includes(w)).length;
      score += overlap * 15;
      return { issue, score };
    })
    .sort((a, b) => b.score - a.score);
  return scored[0]?.issue.issue_title ?? null;
}
