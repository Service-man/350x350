import { BIKE_MODELS } from "@/lib/constants/bikes";
import { SEED_KNOWN_ISSUES } from "@/lib/knowledge/seedKnownIssues";
import type { KnownIssueSeed } from "@/lib/knowledge/knownIssue";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeMentions } from "./normalize";
import { redditAdapter } from "./adapters/reddit";
import { rssAdapter } from "./adapters/rss";
import { youtubeAdapter } from "./adapters/youtube";
import type { SourceAdapter } from "./types";

// Registry consumed by the pipeline and the /data-sources status page.
export const SOURCE_ADAPTERS: SourceAdapter[] = [youtubeAdapter, redditAdapter, rssAdapter];

export type IngestRunResult = {
  source: string;
  status: "ran" | "skipped" | "error";
  upserted: number;
  detail?: string;
};

const NATURAL_KEY = "source_type,brand,model,component,issue_title";

async function upsertRows(
  admin: NonNullable<ReturnType<typeof createAdminClient>>,
  rows: KnownIssueSeed[]
): Promise<number> {
  if (rows.length === 0) return 0;
  const stamped = rows.map((row) => ({ ...row, last_verified_at: new Date().toISOString() }));
  const { error } = await admin.from("known_issues").upsert(stamped, { onConflict: NATURAL_KEY });
  if (error) throw new Error(error.message);
  return rows.length;
}

// Batch entry point, invoked only from the secret-protected /api/ingest route
// (or a script) — never per user request. `only` limits the run to one source
// id, "seed", or "all".
export async function runIngestion(only?: string): Promise<{ results: IngestRunResult[]; totalUpserted: number }> {
  const admin = createAdminClient();
  if (!admin) {
    throw new Error("Ingestion needs SUPABASE_SERVICE_ROLE_KEY and real Supabase env vars.");
  }

  const wants = (source: string) => !only || only === "all" || only === source;
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
      for (const { brand, model } of BIKE_MODELS) {
        const mentions = await adapter.fetchRaw({
          brand,
          model,
          searchTerms: [`${model} problems`, `${model} common issues india`]
        });
        const candidates = normalizeMentions(brand, model, mentions);
        upserted += await upsertRows(admin, candidates);
      }
      results.push({ source: adapter.id, status: "ran", upserted });
    } catch (error) {
      results.push({ source: adapter.id, status: "error", upserted: 0, detail: (error as Error).message });
    }
  }

  return { results, totalUpserted: results.reduce((sum, result) => sum + result.upserted, 0) };
}
