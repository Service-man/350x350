import type { KnownIssue } from "../types";

// A knowledge row before it gets DB identity/timestamps. Used by the curated
// seed, the SQL generator script, and ingestion candidates.
export type KnownIssueSeed = Omit<KnownIssue, "id" | "created_at" | "updated_at" | "last_verified_at">;

type SeedInput = Partial<KnownIssueSeed> &
  Pick<KnownIssueSeed, "brand" | "model" | "component" | "issue_title" | "issue_summary" | "severity">;

// Fills the optional dimensions so seed rows stay terse and consistent.
export function issue(input: SeedInput): KnownIssueSeed {
  return {
    variant: null,
    mfg_year_start: null,
    mfg_year_end: null,
    mileage_band: null,
    service_checkpoint_km: null,
    rpm_band: null,
    symptoms_to_watch: null,
    preventive_action: null,
    typical_cost_min: null,
    typical_cost_max: null,
    mention_count: 0,
    trend_percentage: 0,
    confidence_level: "low",
    source_type: "seed",
    source_url: null,
    ...input
  };
}
