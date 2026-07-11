import { COMPONENT_OPTIONS } from "@/lib/constants/components";
import type { Severity } from "@/lib/types";
import { issue, type KnownIssueSeed } from "@/lib/knowledge/knownIssue";
import type { RawMention } from "./types";

// Deterministic v0 normalization: raw public mentions → candidate known_issues
// rows in the canonical component taxonomy, with mileage/RPM bands inferred
// when stated and provenance attached. Everything here is rule-based on
// purpose; see the note at normalizeMentions() for the LLM extension point.

const COMPONENT_KEYWORDS: Record<string, string[]> = {
  Battery: ["battery", "discharge", "cranking", "won't start", "wont start", "dead cell"],
  Electrical: ["electrical", "wiring", "cluster", "display", "tft", "headlight", "horn", "indicator", "fuse", "regulator", "rectifier"],
  "Chain/Sprocket": ["chain", "sprocket", "chain slack", "chain noise"],
  Clutch: ["clutch", "false neutral", "gear shift hard"],
  "Brake Pads": ["brake", "pads", "disc", "caliper", "squeal"],
  Tyres: ["tyre", "tire", "puncture", "tube", "tread"],
  "Engine/Cooling": ["engine", "overheat", "heating", "coolant", "radiator", "fan", "oil leak", "misfire", "stall"],
  Suspension: ["suspension", "shock", "fork", "preload", "damping"],
  "ECU/Sensors": ["ecu", "sensor", "abs light", "check engine", "o2 sensor", "side stand sensor"],
  "Fuel System": ["fuel pump", "injector", "fuel gauge", "petrol leak", "mileage drop"],
  Gearbox: ["gearbox", "transmission", "gear slip", "neutral finding"]
};

export function classifyComponent(text: string): string {
  const lowered = text.toLowerCase();
  for (const component of COMPONENT_OPTIONS) {
    const keywords = COMPONENT_KEYWORDS[component];
    if (keywords?.some((keyword) => lowered.includes(keyword))) return component;
  }
  return "General Ownership";
}

const fmt = new Intl.NumberFormat("en-IN");

export function inferMileageBand(text: string): string | null {
  const match = text.match(/(\d{1,2})[,.]?(\d{3})\s*(?:km|kms|kilometer|kilometre)/i);
  if (!match) return null;
  const km = Number(`${match[1]}${match[2]}`);
  if (!Number.isFinite(km) || km <= 0 || km > 200000) return null;
  if (km < 3000) return "0-3,000 km";
  if (km < 5000) return "3,000-5,000 km";
  if (km < 10000) return "5,000-10,000 km";
  if (km < 15000) return "10,000-15,000 km";
  if (km < 20000) return "15,000-20,000 km";
  return "20,000+ km";
}

export function inferRpmBand(text: string): string | null {
  const match = text.match(/(\d{1,2})[,.]?(\d{3})\s*rpm/i);
  if (!match) return null;
  const rpm = Number(`${match[1]}${match[2]}`);
  if (!Number.isFinite(rpm) || rpm < 1000 || rpm > 12000) return null;
  return `${fmt.format(Math.max(1000, rpm - 500))}-${fmt.format(rpm + 500)} rpm`;
}

const HIGH_SEVERITY = ["fire", "seize", "seized", "brake fail", "stall on highway", "engine blew", "cutting off"];
const MEDIUM_SEVERITY = ["leak", "cutoff", "cut off", "warning light", "overheat", "not starting", "breakdown"];

export function inferSeverity(text: string): Severity {
  const lowered = text.toLowerCase();
  if (HIGH_SEVERITY.some((keyword) => lowered.includes(keyword))) return "high";
  if (MEDIUM_SEVERITY.some((keyword) => lowered.includes(keyword))) return "medium";
  return "low";
}

const severityRank: Record<Severity, number> = { low: 0, medium: 1, high: 2, critical: 3 };

function snippet(text: string, length = 140) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > length ? `${clean.slice(0, length - 1)}…` : clean;
}

// Groups mentions per component and emits one conservative candidate row per
// group. EXTENSION POINT: a future LLM pass can replace the title/summary
// construction below with real clustering and summarization — the input
// (RawMention[]) and output (KnownIssueSeed[]) contracts stay the same.
export function normalizeMentions(brand: string, model: string, mentions: RawMention[]): KnownIssueSeed[] {
  const groups = new Map<string, RawMention[]>();
  for (const mention of mentions) {
    const component = classifyComponent(mention.text);
    const group = groups.get(component) ?? [];
    group.push(mention);
    groups.set(component, group);
  }

  const candidates: KnownIssueSeed[] = [];
  for (const [component, group] of groups) {
    if (group.length < 2) continue; // one-off mentions are noise, not a pattern

    let severity: Severity = "low";
    let mileageBand: string | null = null;
    let rpmBand: string | null = null;
    for (const mention of group) {
      const mentionSeverity = inferSeverity(mention.text);
      if (severityRank[mentionSeverity] > severityRank[severity]) severity = mentionSeverity;
      mileageBand = mileageBand ?? inferMileageBand(mention.text);
      rpmBand = rpmBand ?? inferRpmBand(mention.text);
    }

    const sourceType = group[0].sourceType;
    candidates.push(
      issue({
        brand,
        model,
        component,
        issue_title: `Community reports: ${component.toLowerCase()} concerns`,
        issue_summary: `Aggregated from ${group.length} recent public mentions. Example: "${snippet(group[0].text)}"`,
        severity,
        mileage_band: mileageBand,
        rpm_band: rpmBand,
        mention_count: group.length,
        confidence_level: "low",
        source_type: sourceType,
        source_url: group[0].url
      })
    );
  }
  return candidates;
}
