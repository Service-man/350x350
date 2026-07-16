import { z } from "zod";

// Runtime contracts for the ingestion boundary. Every value that crosses an
// edge — an adapter's raw output, an LLM's structured answer, a row headed for
// the database, and the /api/ingest request/response — is parsed against one of
// these schemas, so malformed data fails loudly at the boundary instead of
// silently corrupting the knowledge base.

export const SeveritySchema = z.enum(["low", "medium", "high", "critical"]);
export const ConfidenceSchema = z.enum(["low", "medium", "high"]);
export const SourceTypeSchema = z.enum(["seed", "youtube", "reddit", "rss", "oem", "community"]);

// One public mention returned by a source adapter.
export const RawMentionSchema = z.object({
  externalId: z.string().min(1),
  text: z.string().min(1),
  url: z.string().url(),
  publishedAt: z.string().nullable(),
  sourceType: z.enum(["youtube", "reddit", "rss"])
});
export type RawMentionInput = z.infer<typeof RawMentionSchema>;

// A row on its way into public.known_issues (the shape of KnownIssueSeed).
export const KnownIssueCandidateSchema = z.object({
  brand: z.string().min(1),
  model: z.string().min(1),
  variant: z.string().nullable(),
  mfg_year_start: z.number().int().nullable(),
  mfg_year_end: z.number().int().nullable(),
  component: z.string().min(1),
  issue_title: z.string().min(1).max(200),
  issue_summary: z.string().nullable(),
  severity: SeveritySchema,
  mileage_band: z.string().nullable(),
  service_checkpoint_km: z.number().int().nullable(),
  rpm_band: z.string().nullable(),
  symptoms_to_watch: z.string().nullable(),
  preventive_action: z.string().nullable(),
  possible_solution: z.string().nullable(),
  typical_cost_min: z.number().nullable(),
  typical_cost_max: z.number().nullable(),
  mention_count: z.number().int().nonnegative(),
  trend_percentage: z.number(),
  confidence_level: ConfidenceSchema,
  source_type: SourceTypeSchema,
  source_url: z.string().nullable()
});
export type KnownIssueCandidate = z.infer<typeof KnownIssueCandidateSchema>;

// The structured answer we require back from the Claude validation pass.
export const IssueValidationSchema = z.object({
  is_real_issue: z.boolean(),
  refined_title: z.string().min(1).max(200),
  refined_summary: z.string().min(1),
  severity: SeveritySchema,
  symptoms_to_watch: z.string().min(1),
  preventive_action: z.string().min(1),
  possible_solution: z.string().min(1),
  confidence_level: ConfidenceSchema,
  reasoning: z.string()
});
export type IssueValidation = z.infer<typeof IssueValidationSchema>;

// /api/ingest request: which source(s) to run.
export const INGEST_SOURCES = ["all", "seed", "youtube", "reddit", "rss", "reprocess"] as const;
export const IngestSourceSchema = z.enum(INGEST_SOURCES).default("all");
export type IngestSource = z.infer<typeof IngestSourceSchema>;

// /api/ingest response: per-source outcome + totals.
export const IngestRunResultSchema = z.object({
  source: z.string(),
  status: z.enum(["ran", "skipped", "error"]),
  upserted: z.number().int().nonnegative(),
  enriched: z.number().int().nonnegative().optional(),
  detail: z.string().optional()
});
export type IngestRunResult = z.infer<typeof IngestRunResultSchema>;

export const IngestResponseSchema = z.object({
  results: z.array(IngestRunResultSchema),
  totalUpserted: z.number().int().nonnegative()
});
export type IngestResponse = z.infer<typeof IngestResponseSchema>;
