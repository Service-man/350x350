import { BIKE_MODELS } from "@/lib/constants/bikes";
import { SEED_KNOWN_ISSUES } from "@/lib/knowledge/seedKnownIssues";
import type { KnownIssueSeed } from "@/lib/knowledge/knownIssue";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  KnownIssueCandidateSchema,
  type IngestResponse,
  type IngestRunResult,
  type IngestSource,
  type KnownIssueCandidate
} from "@/lib/ingestion/contracts";
import { isLlmConfigured } from "./llm/anthropic";
import { applyValidation, validateAndEnrichIssue } from "./llm/validateIssue";
import { normalizeMentions } from "./normalize";
import { redditAdapter } from "./adapters/reddit";
import { rssAdapter } from "./adapters/rss";
import { youtubeAdapter } from "./adapters/youtube";
import type { SourceAdapter } from "./types";

// Registry consumed by the pipeline and the /data-sources status page.
export const SOURCE_ADAPTERS: SourceAdapter[] = [youtubeAdapter, redditAdapter, rssAdapter];

// Upper bound on how many un-enriched rows a single reprocess run will send to
// the LLM. Keeps the monthly cron's cost and runtime predictable; the backlog
// is worked through across successive runs (newest/most-discussed first).
const REPROCESS_BATCH_LIMIT = 60;

const NATURAL_KEY = "source_type,brand,model,component,issue_title";

type Admin = NonNullable<ReturnType<typeof createAdminClient>>;

async function upsertRows(admin: Admin, rows: KnownIssueSeed[]): Promise<number> {
  if (rows.length === 0) return 0;
  const stamped = rows.map((row) => ({ ...row, last_verified_at: new Date().toISOString() }));
  const { error } = await admin.from("known_issues").upsert(stamped, { onConflict: NATURAL_KEY });
  if (error) throw new Error(error.message);
  return rows.length;
}

// Runs each deterministic candidate through Claude when the LLM is configured:
// confirmed issues come back refined + with a proposed fix; rejected ones are
// dropped as noise. Without a key this is a no-op passthrough, so ingestion
// still works (just without enrichment). Returns the rows to persist plus how
// many the LLM actually enriched.
async function enrichCandidates(
  candidates: KnownIssueSeed[]
): Promise<{ rows: KnownIssueSeed[]; enriched: number }> {
  if (!isLlmConfigured() || candidates.length === 0) {
    return { rows: candidates, enriched: 0 };
  }

  const rows: KnownIssueSeed[] = [];
  let enriched = 0;
  for (const candidate of candidates) {
    // Bound the value crossing into the LLM against the contract; a malformed
    // candidate is kept as-is rather than blocking the whole run.
    const parsed = KnownIssueCandidateSchema.safeParse(candidate);
    if (!parsed.success) {
      rows.push(candidate);
      continue;
    }
    const validation = await validateAndEnrichIssue(parsed.data);
    if (!validation) {
      rows.push(candidate); // LLM unavailable or errored — keep deterministic row
      continue;
    }
    const applied = applyValidation(parsed.data, validation);
    if (!applied) continue; // rejected as not a real, model-specific issue
    rows.push(applied);
    enriched += 1;
  }
  return { rows, enriched };
}

// Maps a persisted known_issues row back to the candidate contract so it can be
// re-sent through the validation pass.
function rowToCandidate(row: Record<string, unknown>): KnownIssueCandidate | null {
  const parsed = KnownIssueCandidateSchema.safeParse(row);
  return parsed.success ? parsed.data : null;
}

// Reprocess mode: validate and enrich existing rows that have no proposed fix
// yet (possible_solution is null), most-discussed first. Confirmed rows are
// updated in place with the refined content + solution; community rows the
// model rejects as noise are deleted; curated seed rows are always kept.
async function runReprocess(admin: Admin): Promise<IngestRunResult> {
  if (!isLlmConfigured()) {
    return {
      source: "reprocess",
      status: "skipped",
      upserted: 0,
      enriched: 0,
      detail: "Dormant: set ANTHROPIC_API_KEY to enable validation/enrichment."
    };
  }

  const { data, error } = await admin
    .from("known_issues")
    .select("*")
    .is("possible_solution", null)
    .order("mention_count", { ascending: false })
    .limit(REPROCESS_BATCH_LIMIT);
  if (error) {
    return { source: "reprocess", status: "error", upserted: 0, enriched: 0, detail: error.message };
  }

  let enriched = 0;
  let dropped = 0;
  for (const row of data ?? []) {
    const candidate = rowToCandidate(row as Record<string, unknown>);
    if (!candidate) continue;
    const validation = await validateAndEnrichIssue(candidate);
    if (!validation) continue;

    if (!validation.is_real_issue) {
      // Keep curated seed rows even if the model is unsure; only prune community noise.
      if (candidate.source_type !== "seed") {
        const { error: delError } = await admin.from("known_issues").delete().eq("id", (row as { id: string }).id);
        if (!delError) dropped += 1;
      }
      continue;
    }

    const applied = applyValidation(candidate, validation);
    if (!applied) continue;
    const { error: updError } = await admin
      .from("known_issues")
      .update({
        issue_title: applied.issue_title,
        issue_summary: applied.issue_summary,
        severity: applied.severity,
        symptoms_to_watch: applied.symptoms_to_watch,
        preventive_action: applied.preventive_action,
        possible_solution: applied.possible_solution,
        confidence_level: applied.confidence_level,
        last_verified_at: new Date().toISOString()
      })
      .eq("id", (row as { id: string }).id);
    if (!updError) enriched += 1;
  }

  return {
    source: "reprocess",
    status: "ran",
    upserted: enriched,
    enriched,
    detail: dropped > 0 ? `Enriched ${enriched}, pruned ${dropped} unconfirmed community rows.` : `Enriched ${enriched}.`
  };
}

// Batch entry point, invoked only from the secret-protected /api/ingest route
// (or a script) — never per user request. `only` limits the run to one source,
// "seed", "reprocess", or "all".
export async function runIngestion(only: IngestSource = "all"): Promise<IngestResponse> {
  const admin = createAdminClient();
  if (!admin) {
    throw new Error("Ingestion needs SUPABASE_SERVICE_ROLE_KEY and real Supabase env vars.");
  }

  const wants = (source: string) => only === "all" || only === source;
  const results: IngestRunResult[] = [];

  // Curated seed is itself a source: syncing it keeps the DB aligned with
  // lib/knowledge/seedKnownIssues.ts without re-running SQL migrations.
  if (wants("seed")) {
    try {
      const upserted = await upsertRows(admin, SEED_KNOWN_ISSUES);
      results.push({ source: "seed", status: "ran", upserted });
    } catch (error) {
      results.push({ source: "seed", status: "error", upserted: 0, detail: (error as Error).message });
    }
  }

  for (const adapter of SOURCE_ADAPTERS) {
    if (!wants(adapter.id)) continue;
    if (!adapter.isConfigured()) {
      results.push({
        source: adapter.id,
        status: "skipped",
        upserted: 0,
        detail: `Dormant: set ${adapter.requiredEnv.join(" + ")} to enable.`
      });
      continue;
    }

    try {
      let upserted = 0;
      let enriched = 0;
      for (const { brand, model } of BIKE_MODELS) {
        const mentions = await adapter.fetchRaw({
          brand,
          model,
          searchTerms: [`${model} problems`, `${model} common issues india`]
        });
        const candidates = normalizeMentions(brand, model, mentions);
        const result = await enrichCandidates(candidates);
        upserted += await upsertRows(admin, result.rows);
        enriched += result.enriched;
      }
      results.push({ source: adapter.id, status: "ran", upserted, enriched });
    } catch (error) {
      results.push({ source: adapter.id, status: "error", upserted: 0, detail: (error as Error).message });
    }
  }

  // Validate + enrich existing rows (adds proposed fixes, prunes noise).
  if (wants("reprocess")) {
    results.push(await runReprocess(admin));
  }

  return { results, totalUpserted: results.reduce((sum, result) => sum + result.upserted, 0) };
}
