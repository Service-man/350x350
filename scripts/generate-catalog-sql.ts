// Regenerates supabase/migrations/007_seed_bike_catalog.sql from the canonical
// TypeScript catalogue. Run with: npm run seed:sql
// Never edit the generated SQL by hand — edit lib/catalog/bikeCatalog.ts.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BIKE_CATALOG_SEED } from "../lib/catalog/bikeCatalog";

const COLUMNS = [
  "brand",
  "model",
  "engine_cc",
  "body_type",
  "year_start",
  "year_end",
  "retail_band",
  "popular"
] as const;

const UPDATE_COLUMNS = COLUMNS.filter((c) => c !== "brand" && c !== "model");

function lit(value: string | number | boolean | null): string {
  if (value === null) return "null";
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  return `'${value.replace(/'/g, "''")}'`;
}

const header = `-- GENERATED FILE — do not edit by hand.
-- Source of truth: lib/catalog/bikeCatalog.ts
-- Regenerate with: npm run seed:sql
-- Idempotent: re-running refreshes existing rows via the (brand, model) key.

insert into public.bike_catalog (
  ${COLUMNS.join(",\n  ")}
) values
`;

const footer = `
on conflict (brand, model) do update set
  ${UPDATE_COLUMNS.map((c) => `${c} = excluded.${c}`).join(",\n  ")},
  updated_at = now();
`;

const body = BIKE_CATALOG_SEED.map(
  (row) => `  (${COLUMNS.map((c) => lit(row[c] as string | number | boolean | null)).join(", ")})`
).join(",\n");

const scriptDir = dirname(fileURLToPath(import.meta.url));
const outPath = join(scriptDir, "..", "supabase", "migrations", "007_seed_bike_catalog.sql");
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, header + body + footer);
console.log(`Wrote ${BIKE_CATALOG_SEED.length} catalogue rows to ${outPath}`);
