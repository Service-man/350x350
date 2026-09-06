import { CRUISING_SPEEDS, RIDE_FREQUENCIES, SERVICE_NUMBERS, PILLION_OPTIONS, USAGE_TYPE_LABELS } from "@/lib/constants/bikes";
import type { ComponentRiskScore } from "@/lib/risk/riskScoring";
import type { Bike, KnownIssue, KundliAskField, RidingProfile, ServiceLog, ServiceLogDraft, SymptomLog } from "@/lib/types";
import { formatInr, formatKm } from "@/lib/utils";
import { draftMissing } from "./extract";

// The deterministic kundli engine. It is the always-on baseline (demo mode,
// no API key, or an AI call that failed) and the source of the quick-reply
// chips in every mode. Predictions blend the risk scorer, the model's known
// issues, and the rider's own pattern; nothing here is invented.

export type KundliContext = {
  bike: Bike | null;
  bikes: Bike[];
  serviceLogs: ServiceLog[];
  symptoms: SymptomLog[];
  knownIssues: KnownIssue[];
  risks: ComponentRiskScore[];
};

export type Prediction = {
  component: string;
  score: number;
  why: string[];
  window: string;
  issueTitle: string | null;
};

// ── Trailer parsing (shared by AI and rules replies) ─────────────────────────
const ASK_FIELDS: KundliAskField[] = [
  "cruising_speed", "ride_frequency", "daily_distance_km", "daily_ride_minutes", "pillion",
  "service_number", "odometer_km", "service_date", "parts_reason"
];

export function splitTrailer(text: string): { body: string; ask: KundliAskField | null; chips: string[] } {
  let ask: KundliAskField | null = null;
  let chips: string[] = [];
  const kept: string[] = [];
  for (const line of text.split("\n")) {
    const askMatch = line.match(/^\s*ASK:\s*([a-z_]+)\s*$/i);
    const chipMatch = line.match(/^\s*CHIPS:\s*(.+)$/i);
    if (askMatch) {
      const field = askMatch[1].toLowerCase() as KundliAskField;
      if (ASK_FIELDS.includes(field)) ask = field;
    } else if (chipMatch) {
      chips = chipMatch[1].split("|").map((c) => c.trim()).filter(Boolean).slice(0, 6);
    } else {
      kept.push(line);
    }
  }
  return { body: kept.join("\n").trim(), ask, chips };
}

// ── Question flow ────────────────────────────────────────────────────────────
type Question = { field: KundliAskField; text: string; chips: string[] };

const PROFILE_QUESTIONS: Array<{ field: KundliAskField; missing: (p: RidingProfile) => boolean; text: string; chips: string[] }> = [
  {
    field: "cruising_speed",
    missing: (p) => !p.cruising_speed,
    text: "Day to day, what speed do you feel most comfortable cruising at?",
    chips: CRUISING_SPEEDS.map(([, label]) => label)
  },
  {
    field: "ride_frequency",
    missing: (p) => !p.ride_frequency,
    text: "How often does the bike actually roll out?",
    chips: RIDE_FREQUENCIES.map(([, label]) => label)
  },
  {
    field: "daily_distance_km",
    missing: (p) => !p.daily_distance_km,
    text: "On a typical riding day, roughly how many km do you cover?",
    chips: ["Under 10 km", "10–30 km", "30–60 km", "60–100 km", "100+ km"]
  },
  {
    field: "daily_ride_minutes",
    missing: (p) => !p.daily_ride_minutes,
    text: "And how long are you in the saddle on that day, all rides added up?",
    chips: ["Under 30 min", "30–60 min", "1–2 hours", "2+ hours"]
  },
  {
    field: "pillion",
    missing: (p) => !p.pillion,
    text: "Last one — do you usually ride with a pillion or luggage?",
    chips: PILLION_OPTIONS.map(([, label]) => label)
  }
];

export function nextProfileQuestion(bike: Bike | null): Question | null {
  if (!bike) return null;
  const profile = bike.riding_profile ?? {};
  const next = PROFILE_QUESTIONS.find((q) => q.missing(profile));
  return next ? { field: next.field, text: next.text, chips: next.chips } : null;
}

export function profileAnswered(bike: Bike | null): number {
  if (!bike) return 0;
  const profile = bike.riding_profile ?? {};
  return PROFILE_QUESTIONS.filter((q) => !q.missing(profile)).length;
}

// Interpret a chip or free-text answer for the field the assistant asked for.
// Returns the value to store, or null if the text does not answer it.
export function parseAnswer(field: KundliAskField, text: string): string | number | null {
  const t = text.trim().toLowerCase();
  const pick = <T extends readonly (readonly [string, string])[]>(options: T) => {
    const hit = options.find(([value, label]) => t === label.toLowerCase() || t === value.toLowerCase() || t.includes(label.toLowerCase().replace(/\s*km\/h/, "")));
    return hit ? hit[0] : null;
  };
  const firstNumber = () => {
    const m = t.match(/(\d+(?:\.\d+)?)/);
    return m ? Number(m[1]) : null;
  };
  switch (field) {
    case "cruising_speed": {
      const byLabel = pick(CRUISING_SPEEDS);
      if (byLabel) return byLabel;
      const n = firstNumber();
      if (n === null) return null;
      if (n < 60) return "40-60";
      if (n < 80) return "60-80";
      if (n < 100) return "80-100";
      return "100+";
    }
    case "ride_frequency": {
      const byLabel = pick(RIDE_FREQUENCIES);
      if (byLabel) return byLabel;
      if (/daily|every ?day|everyday|roz/.test(t)) return "daily";
      if (/weekday|office|mon/.test(t)) return "weekdays";
      if (/weekend|sunday|saturday/.test(t)) return "weekends";
      if (/occasion|rare|sometimes|kabhi/.test(t)) return "occasional";
      return null;
    }
    case "daily_distance_km": {
      if (/under 10/.test(t)) return 8;
      if (/10.?30/.test(t)) return 20;
      if (/30.?60/.test(t)) return 45;
      if (/60.?100/.test(t)) return 80;
      if (/100\+/.test(t)) return 120;
      return firstNumber();
    }
    case "daily_ride_minutes": {
      if (/under 30/.test(t)) return 20;
      if (/30.?60/.test(t)) return 45;
      if (/1.?2 hour/.test(t)) return 90;
      if (/2\+ hour/.test(t)) return 150;
      const n = firstNumber();
      if (n === null) return null;
      return /hour|hr/.test(t) ? Math.round(n * 60) : Math.round(n);
    }
    case "pillion":
      return pick(PILLION_OPTIONS) ?? (/rare|solo|never|alone/.test(t) ? "rarely" : /often|always|mostly|daily/.test(t) ? "often" : /sometimes|weekend/.test(t) ? "sometimes" : null);
    case "service_number": {
      const byLabel = pick(SERVICE_NUMBERS);
      if (byLabel) return byLabel;
      if (/post|after|6|7|8|paid/.test(t)) return "post5";
      const n = firstNumber();
      return n && n >= 1 && n <= 5 ? String(Math.round(n)) : null;
    }
    case "odometer_km":
      return firstNumber();
    case "service_date": {
      const m = t.match(/(\d{4})-(\d{2})-(\d{2})/) ?? t.match(/(\d{1,2})[\/-](\d{1,2})[\/-](20\d{2})/);
      if (!m) return null;
      return m[0].includes("-") && m[0].length === 10 && m[1].length === 4 ? m[0] : `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
    }
    case "parts_reason":
      return text.trim() || null;
  }
}

// ── Prediction engine ────────────────────────────────────────────────────────
const COMPONENT_TERMS: Record<string, string[]> = {
  Battery: ["battery", "starter", "start", "crank"],
  Electrical: ["electrical", "relay", "fuse", "wiring", "bulb", "headlight", "indicator", "horn"],
  "Chain/Sprocket": ["chain", "sprocket"],
  Clutch: ["clutch"],
  "Brake Pads": ["brake", "pad", "disc", "rotor"],
  Tyres: ["tyre", "tire", "tube", "puncture", "tread"],
  "Engine/Cooling": ["engine", "oil", "coolant", "fan", "heat", "overheat", "radiator", "spark plug"],
  Suspension: ["suspension", "fork", "shock", "damper", "wobble"],
  "ECU/Sensors": ["ecu", "sensor", "check engine", "abs light", "error"],
  "Fuel System": ["fuel", "petrol", "injector", "pump", "mileage", "carb"],
  Gearbox: ["gear", "gearbox", "false neutral", "shift"]
};

const MAINTENANCE_ONLY = /\b(?:clean(?:ed|ing)?|lube[sd]?|lubricat\w*|adjust\w*|tension\w*|wash\w*|polish\w*|greas\w*|top[- ]?up|check\w*|inspect\w*)\b/i;

function componentFor(text: string): string | null {
  const t = text.toLowerCase();
  for (const [component, terms] of Object.entries(COMPONENT_TERMS)) {
    if (terms.some((term) => t.includes(term))) return component;
  }
  return null;
}

export function componentFromText(text: string) {
  return componentFor(text);
}

export function predict(ctx: KundliContext): Prediction[] {
  const { bike, serviceLogs, symptoms, knownIssues, risks } = ctx;
  if (!bike) return [];
  const profile = bike.riding_profile ?? {};
  const scores = new Map<string, { score: number; why: string[]; issueTitle: string | null; window: string | null }>();
  const bump = (component: string, delta: number, why?: string) => {
    const entry = scores.get(component) ?? { score: 0, why: [], issueTitle: null, window: null };
    entry.score += delta;
    if (why && !entry.why.includes(why)) entry.why.push(why);
    scores.set(component, entry);
  };

  // 1. Risk scorer baseline (already accounts for open symptoms + odometer).
  for (const risk of risks) {
    bump(risk.component, risk.score);
    for (const reason of risk.reasons.slice(0, 2)) if (!reason.startsWith("No strong")) bump(risk.component, 0, reason);
  }

  // 2. Riding pattern — the part the feedback asked for.
  const usage = bike.usage_type ?? "mixed";
  const usageLabel = USAGE_TYPE_LABELS[usage];
  const pattern: Record<string, Array<[string, number]>> = {
    city: [["Clutch", 12], ["Brake Pads", 12], ["Chain/Sprocket", 8], ["Battery", 6]],
    highway: [["Tyres", 10], ["Chain/Sprocket", 8], ["Engine/Cooling", 6]],
    touring: [["Tyres", 12], ["Chain/Sprocket", 10], ["Suspension", 8], ["Battery", 4]],
    offroad: [["Suspension", 15], ["Chain/Sprocket", 12], ["Tyres", 10], ["Electrical", 6]],
    mixed: [["Chain/Sprocket", 6], ["Brake Pads", 6]]
  };
  for (const [component, delta] of pattern[usage] ?? pattern.mixed) bump(component, delta, `your rides are mostly "${usageLabel}"`);

  if (profile.cruising_speed === "100+") {
    bump("Tyres", 10, "sustained 100+ km/h cruising wears tyres and chain faster");
    bump("Engine/Cooling", 8, "high-speed running keeps engine temperatures up");
    bump("Brake Pads", 6, "braking from high speed adds pad wear");
  } else if (profile.cruising_speed === "80-100") {
    bump("Tyres", 5, "80–100 km/h cruising adds tyre wear");
    bump("Chain/Sprocket", 4, "steady highway speeds load the chain");
  }
  const dist = profile.daily_distance_km ?? null;
  if (dist !== null && dist >= 80) {
    bump("Tyres", 8, `${dist} km a day racks up tyre mileage quickly`);
    bump("Chain/Sprocket", 8, "high daily km shortens chain life");
    bump("Engine/Cooling", 5, "oil intervals arrive sooner at this daily distance");
  } else if (dist !== null && dist < 10) {
    bump("Battery", 10, "very short hops rarely let the battery fully recharge");
    bump("Engine/Cooling", 4, "short trips mean the engine seldom reaches full operating temperature");
  }
  if (profile.ride_frequency === "daily" && (profile.daily_ride_minutes ?? 0) >= 90) {
    for (const c of ["Chain/Sprocket", "Brake Pads", "Tyres", "Clutch"]) bump(c, 5, "daily long saddle time accelerates general wear");
  }
  if (profile.pillion === "often") {
    bump("Suspension", 8, "regular pillion/luggage loads the rear suspension");
    bump("Brake Pads", 6, "extra weight adds braking load");
    bump("Tyres", 4, "load raises rear tyre wear");
  }

  // 3. Fresh parts reset the clock; open symptoms raise it.
  const bikeLogs = serviceLogs.filter((l) => l.bike_id === bike.id).sort((a, b) => b.service_date.localeCompare(a.service_date));
  const latest = bikeLogs[0];
  if (latest?.parts_replaced) {
    for (const part of latest.parts_replaced.split(/,|;/)) {
      // A cleaned, lubed, adjusted or checked part is not a new part — only a
      // real replacement resets that component's clock.
      if (MAINTENANCE_ONLY.test(part)) continue;
      const component = componentFor(part);
      if (component) bump(component, -25, `${part.trim()} was replaced on ${latest.service_date}`);
    }
  }
  for (const s of symptoms.filter((s) => s.bike_id === bike.id && !s.resolved)) {
    const component = componentFor(`${s.component} ${s.symptom_title} ${s.symptom_description ?? ""}`) ?? s.component;
    bump(component, 15, `you logged "${s.symptom_title}"`);
  }

  // 4. Known issues for this model near the current km.
  const odo = bike.odometer_km;
  for (const issue of knownIssues) {
    const entry = scores.get(issue.component) ?? { score: 0, why: [], issueTitle: null, window: null };
    const mentionBoost = Math.min(15, Math.round(issue.mention_count / 2));
    let boost = mentionBoost;
    let window: string | null = null;
    if (issue.service_checkpoint_km) {
      const distance = issue.service_checkpoint_km - odo;
      if (distance >= -1500 && distance <= 4000) {
        boost += 12;
        window = distance > 0 ? `around ${formatKm(issue.service_checkpoint_km)} (~${formatKm(distance)} away)` : "now — that checkpoint has passed";
      }
    }
    if (boost > mentionBoost || !entry.issueTitle) {
      entry.score += boost;
      if (!entry.issueTitle || boost > mentionBoost) {
        entry.issueTitle = issue.issue_title;
        entry.window = window ?? entry.window;
        entry.why.push(`${issue.mention_count} riders of this model reported "${issue.issue_title}"`);
      }
      scores.set(issue.component, entry);
    }
  }

  return [...scores.entries()]
    .map(([component, e]) => ({
      component,
      score: Math.max(0, Math.min(100, e.score)),
      why: e.why.slice(0, 3),
      window: e.window ?? defaultWindow(usage, dist),
      issueTitle: e.issueTitle
    }))
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

function defaultWindow(usage: string, dailyKm: number | null) {
  if (dailyKm && dailyKm >= 80) return "within the next 1,500–2,500 km";
  if (usage === "offroad" || usage === "touring") return "within the next 2,000–3,000 km";
  return "within the next 3,000–5,000 km";
}

// ── Reply composer (rules mode) ──────────────────────────────────────────────
export type RulesReply = { text: string; ask: KundliAskField | null; chips: string[]; draft?: ServiceLogDraft | null };

const NEED_TO_START = 2; // riding answers before a full reading

export function composeReply(input: {
  ctx: KundliContext;
  userText: string;
  draft?: ServiceLogDraft | null;
  extractionVia?: "llm" | "rules" | "none";
  justAnswered?: KundliAskField | null;
}): RulesReply {
  const { ctx, userText, draft, extractionVia, justAnswered } = input;
  const bike = ctx.bike;

  if (!bike) {
    return {
      text: "Namaste 🙏 I'm your bike's kundli. To read its future I need to know the bike — add it in the Garage first (brand, model, km), then come back and we'll begin.",
      ask: null,
      chips: []
    };
  }

  // A bill just came in → summarise, list what's missing, ask one thing.
  if (draft && extractionVia) {
    const found: string[] = [];
    if (draft.service_date) found.push(`dated ${draft.service_date}`);
    if (draft.odometer_km) found.push(`at ${formatKm(draft.odometer_km)}`);
    if (draft.total_cost) found.push(`${formatInr(draft.total_cost)} total`);
    if (draft.parts_replaced) found.push(`parts: ${draft.parts_replaced}`);
    if (draft.garage_name) found.push(`at ${draft.garage_name}`);
    const missing = draftMissing(draft);
    const lead =
      extractionVia === "none"
        ? "I got the file, but I can't read images without the AI key configured — no tension, tell me the details and I'll do the rest."
        : found.length
          ? `Read your bill 🧾 — ${found.join(", ")}.`
          : "I read the file but couldn't pick out the key numbers — let's fill them in together.";
    const q = missing[0] ? askForDraftField(missing[0]) : null;
    if (q) return { text: `${lead}\n\n${q.text}`, ask: q.field, chips: q.chips, draft };
    if (draft.parts_replaced && !draft.notes) {
      return {
        text: `${lead}\n\nOne thing that tells me a lot: why was **${draft.parts_replaced}** replaced — regular wear, or did something fail early?`,
        ask: "parts_reason",
        chips: ["Regular wear", "Failed early", "Mechanic suggested", "Not sure"],
        draft
      };
    }
    return {
      text: `${lead}\n\nEverything I need is here — tap **Save as service log** below to keep it, and I'll fold it into your reading.\n\n${readingText(ctx)}`,
      ask: null,
      chips: [],
      draft
    };
  }

  // Free-text question about a component → answer from known issues.
  const asked = componentFor(userText);
  const isQuestion = /\?|why|what|how|should|kya|kyu|kaise/i.test(userText);
  if (asked && isQuestion && !justAnswered) {
    const issues = ctx.knownIssues.filter((i) => i.component === asked).slice(0, 2);
    const risk = ctx.risks.find((r) => r.component === asked);
    const lines = [
      `**${asked}** on your ${bike.model}${risk ? ` — current risk reads ${risk.level.toLowerCase()} (${risk.score}/100)` : ""}.`
    ];
    for (const i of issues) {
      lines.push(`- ${i.issue_title}${i.mileage_band ? ` · ${i.mileage_band}` : ""}${i.symptoms_to_watch ? ` — watch for: ${i.symptoms_to_watch}` : ""}`);
      if (i.preventive_action) lines.push(`  Prevent: ${i.preventive_action}`);
    }
    if (!issues.length) lines.push("Nothing model-specific is catalogued for it yet — that's usually good news.");
    if (risk) lines.push(`\nNext step: ${risk.recommendedAction}`);
    return { text: lines.join("\n"), ask: null, chips: ["Give me the full reading", "Upload my last bill"] };
  }

  // Profile question flow, then the reading.
  const answered = profileAnswered(bike);
  const next = nextProfileQuestion(bike);
  const ack = justAnswered ? "Noted. " : "";

  if (answered < NEED_TO_START && next) {
    const intro = answered === 0 && !justAnswered
      ? `Namaste 🙏 Let's read the kundli of your **${bike.brand} ${bike.model}** at ${formatKm(bike.odometer_km)}. Two quick questions about how you ride, then I'll tell you what's coming.\n\n`
      : ack;
    return { text: `${intro}${next.text}`, ask: next.field, chips: next.chips };
  }

  const reading = readingText(ctx);
  if (next) {
    return { text: `${ack}${reading}\n\nTo sharpen this: ${next.text}`, ask: next.field, chips: next.chips };
  }
  return {
    text: `${ack}${reading}\n\nAsk me about any part, or upload your next service bill and I'll update the reading.`,
    ask: null,
    chips: ["Upload my last bill", "What should I check this week?"]
  };
}

function askForDraftField(field: "service_date" | "odometer_km" | "service_number"): Question {
  if (field === "service_date") return { field, text: "What date was this service? (e.g. 12/07/2026)", chips: [] };
  if (field === "odometer_km") return { field, text: "What was the odometer reading at this service, in km?", chips: [] };
  return { field, text: "Which service was this?", chips: SERVICE_NUMBERS.map(([, label]) => label) };
}

export function readingText(ctx: KundliContext): string {
  const bike = ctx.bike!;
  const predictions = predict(ctx);
  const lines = [`**Kundli for your ${bike.brand} ${bike.model}** · ${formatKm(bike.odometer_km)}`];
  if (!predictions.length) {
    lines.push("Nothing is flagging yet — keep logging services and symptoms and the picture sharpens.");
    return lines.join("\n");
  }
  predictions.slice(0, 4).forEach((p, i) => {
    const label = p.score >= 70 ? "likely" : p.score >= 40 ? "watch" : "low";
    lines.push(`${i + 1}. **${p.component}** (${label}) — ${p.why[0] ?? "pattern-based"}. Window: ${p.window}.`);
    if (p.issueTitle) lines.push(`   Known on this model: ${p.issueTitle}`);
  });
  const top = predictions[0];
  const risk = ctx.risks.find((r) => r.component === top.component);
  lines.push(`\nNext step: ${risk?.recommendedAction ?? `Have ${top.component.toLowerCase()} checked at your next service.`}`);
  return lines.join("\n");
}

// A compact, factual context block handed to the AI provider.
export function contextBlock(ctx: KundliContext, draft?: ServiceLogDraft | null): string {
  const { bike, serviceLogs, symptoms, knownIssues, risks } = ctx;
  const lines: string[] = ["CONTEXT"];
  if (!bike) {
    lines.push("bike: none added yet (ask the rider to add one in the Garage)");
    return lines.join("\n");
  }
  const p = bike.riding_profile ?? {};
  lines.push(`bike: ${bike.brand} ${bike.model}${bike.variant ? ` ${bike.variant}` : ""}, mfg ${bike.manufacturing_year ?? "?"}, odometer ${bike.odometer_km} km, city ${bike.city ?? "?"}, mods: ${bike.has_modifications ? bike.modification_notes ?? "yes" : "none"}`);
  lines.push(`riding pattern: route=${bike.usage_type ?? "unknown"} (${USAGE_TYPE_LABELS[bike.usage_type ?? "mixed"]}), cruising=${p.cruising_speed ?? "unknown"}, frequency=${p.ride_frequency ?? "unknown"}, daily_km=${p.daily_distance_km ?? "unknown"}, daily_minutes=${p.daily_ride_minutes ?? "unknown"}, pillion=${p.pillion ?? "unknown"}`);
  const logs = serviceLogs.filter((l) => l.bike_id === bike.id).slice(0, 5);
  lines.push(`service logs (${logs.length}):`);
  for (const l of logs) lines.push(`- ${l.service_date} · ${l.odometer_km} km · ${l.service_type}${l.service_number ? ` · service #${l.service_number}` : ""} · ${l.total_cost ? `₹${l.total_cost}` : "cost ?"} · parts: ${l.parts_replaced ?? "none"}${l.notes ? ` · notes: ${l.notes}` : ""}`);
  const open = symptoms.filter((s) => s.bike_id === bike.id && !s.resolved).slice(0, 5);
  lines.push(`open symptoms (${open.length}):`);
  for (const s of open) lines.push(`- ${s.symptom_date} · ${s.component} · ${s.symptom_title} (${s.severity}${s.frequency ? `, ${s.frequency}` : ""})${s.symptom_description ? ` — ${s.symptom_description}` : ""}`);
  lines.push("risk scores:");
  for (const r of risks) lines.push(`- ${r.component}: ${r.score}/100 ${r.level}${r.reasons[0] && !r.reasons[0].startsWith("No strong") ? ` — ${r.reasons[0]}` : ""}`);
  lines.push(`known issues for this model (${knownIssues.length}, top by mentions):`);
  for (const i of knownIssues.slice(0, 8)) lines.push(`- [${i.component}] ${i.issue_title} · ${i.mileage_band ?? i.rpm_band ?? "general"}${i.service_checkpoint_km ? ` · checkpoint ${i.service_checkpoint_km} km` : ""} · ${i.mention_count} mentions · ${i.severity}${i.symptoms_to_watch ? ` · watch: ${i.symptoms_to_watch}` : ""}${i.preventive_action ? ` · prevent: ${i.preventive_action}` : ""}`);
  if (draft) lines.push(`bill just uploaded (extracted): ${JSON.stringify(draft)} · missing: ${draftMissing(draft).join(", ") || "nothing"}`);
  lines.push("END CONTEXT");
  return lines.join("\n");
}
