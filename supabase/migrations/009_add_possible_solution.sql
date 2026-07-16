-- 009: Add possible_solution to the knowledge base.
-- The LLM validation/enrichment pass (lib/ingestion/llm) proposes a concrete
-- fix for each confirmed issue and writes it here. Curated seed rows leave it
-- null until reprocessed, so it is nullable with no default.
--
-- Ordering note: this runs AFTER 005_seed_known_issues.sql, which is why the
-- SQL seed generator does not emit this column — seed rows get null here and
-- are backfilled by `/api/ingest?source=reprocess` once an ANTHROPIC_API_KEY is set.

alter table public.known_issues
  add column if not exists possible_solution text;

comment on column public.known_issues.possible_solution is
  'Concrete remedy/fix for the issue, proposed by the LLM validation pass. Null until enriched.';
