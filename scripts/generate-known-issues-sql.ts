// Regenerates supabase/migrations/005_seed_known_issues.sql from the canonical
// TypeScript seed. Run with: npm run seed:sql
// Never edit the generated SQL by hand — edit lib/knowledge/seedKnownIssues.ts.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SEED_KNOWN_ISSUES } from "../lib/knowledge/seedKnownIssues";
import type { KnownIssueSeed } from "../lib/knowledge/knownIssue";

const COLUMNS: (keyof KnownIssueSeed)[] = [
  "brand",
  "model",
  "variant",
  "mfg_year_start",
  "mfg_year_end",
  "component",
  "issue_title",
  "issue_summary",
  "severity",
  "mileage_band",
  "service_checkpoint_km",
  "rpm_band",
  "symptoms_to_watch",
  "preventive_action",
  "typical_cost_min",
  "typical_cost_max",
  "mention_count",
  "trend_percentage",
  "confidence_level",
  "source_type",
  "source_url"
];

// Columns refreshed when a row with the same natural key already exists.
const UPDATE_COLUMNS = COLUMNS.filter(
  (column) => !["brand", "model", "component", "issue_title", "source_type"].includes(column)
);

function sqlLiteral(value: string | number | null): string {
  if (value === null) return "null";
  if (typeof value === "number") return String(value);
  return `'${value.replace(/'/g, "''")}'`;
}

function rowTuple(row: KnownIssueSeed): string {
  const values = COLUMNS.map((column) => sqlLiteral(row[column] as string | number | null));
  values.push("now()"); // last_verified_at
  return `  (${values.join(", ")})`;
}

const header = `-- GENERATED FILE — do not edit by hand.
-- Source of truth: lib/knowledge/seedKnownIssues.ts
-- Regenerate with: npm run seed:sql
-- Idempotent: re-running refreshes existing rows via the natural key.

insert into public.known_issues (
  ${COLUMNS.join(",\n  ")},
  last_verified_at
) values
`;

const footer = `
on conflict (source_type, brand, model, component, issue_title) do update set
  ${UPDATE_COLUMNS.map((column) => `${column} = excluded.${column}`).join(",\n  ")},
  last_verified_at = now(),
  updated_at = now();
`;

const body = SEED_KNOWN_ISSUES.map(rowTuple).join(",\n");
const sql = header + body + footer;

const scriptDir = dirname(fileURLToPath(import.meta.url));
const outPath = join(scriptDir, "..", "supabase", "migrations", "005_seed_known_issues.sql");
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, sql);
console.log(`Wrote ${SEED_KNOWN_ISSUES.length} seed rows to ${outPath}`);
