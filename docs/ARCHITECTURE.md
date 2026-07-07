# 350x Garage — Architecture & Codebase Map

_Last reviewed: 2026-07-07 (branch `claude/350x-garage-structure-dvuxen`, post inform-first refactor)_

This document describes the repository **as it exists today**. The refactor brief that produced this
state is `docs/REFINEMENT_PROMPT.md`.

---

## 1. What the app is

350x Garage is a **Next.js 16 (App Router) + Supabase** rider-intelligence platform for 350cc+
motorcycles in India, built **inform-first**:

- **Public knowledge base** (no login): pick a model → see known issues organized by **service
  checkpoint (mileage)**, **manufacturing window (batch)**, and **RPM band**, each with symptoms to
  watch, a preventive action, a ₹ cost band, confidence, and provenance.
- **Opt-in tracking** (login): garage, service logs with bill uploads, symptom logs, and a rule-based
  component risk score computed from the rider's own data.

**Demo mode**: with no Supabase env vars (preview deployments), public pages render the curated
TypeScript seed, the logged-in area uses a demo dataset behind a fake cookie, and writes are disabled.

---

## 2. Tech stack

| Layer      | Choice |
|------------|--------|
| Framework  | Next.js `^16.2.6`, App Router, React 19, Server Components + Server Actions |
| Language   | TypeScript (`strict`) |
| Styling    | Tailwind CSS 3, custom tokens (`ink`, `leaf`, `paper`, …) |
| Backend    | Supabase — Postgres, Auth, Storage, RLS |
| SSR auth   | `@supabase/ssr` cookie client (`proxy.ts` refreshes sessions) |
| Ingestion  | In-repo adapter layer (YouTube/Reddit/RSS), dormant without keys |
| Build      | `next build --webpack`; `tsx` (dev-only) for the seed-SQL generator |
| Hosting    | Vercel |

Cost posture: near-zero. Free API tiers only; ingestion is an off-by-default batch job.

---

## 3. Directory structure

```
app/
  page.tsx                     # PUBLIC landing: model picker, inform-first CTAs
  models/page.tsx              # PUBLIC model library index (ISR, 1h)
  models/[brand]/[model]/      # PUBLIC model intelligence: checkpoint timeline,
                               #   batch (?year= highlight), RPM, other sections
  library/page.tsx             # PUBLIC search/browse over known_issues (6 filters)
  problem-radar/page.tsx       # Redirect → /library (legacy links)
  data-sources/page.tsx        # PUBLIC adapter registry status + compliance stance
  login/ signup/               # Auth screens (demo fallback)
  dashboard/                   # OPT-IN: stats, real 6-mo maintenance trend,
                               #   model known-issues, risk summary
  garage/ service-logs/ symptoms/ health/ settings/   # OPT-IN capture + risk
  actions/                     # "use server" actions: bikes, serviceLogs,
                               #   symptoms, account (delete-my-data)
  api/ingest/route.ts          # Secret-protected batch ingestion endpoint

components/
  PublicShell.tsx              # Cookie-free public chrome (top nav + disclaimer footer)
  AppShell.tsx Sidebar.tsx     # Logged-in chrome; sidebar split: My garage / Explore
  ModelPicker.tsx              # "use client" brand→model→year picker
  KnownIssueCard.tsx           # Issue card: dims, watch-for, action, cost, provenance
  BikeForm/ServiceLogForm/SymptomForm  # "use client" + useActionState → server actions
  DeleteDataButton.tsx         # Two-step confirm → deleteMyDataAction
  AuthForm BikeCard StatCard RiskScoreCard EmptyState LoadingState LogoutButton

lib/
  knowledge/
    seedKnownIssues.ts         # CANONICAL curated seed (42 rows) + demo row mapper
    knownIssue.ts              # KnownIssueSeed type + issue() helper
    getKnownIssues.ts          # Public read: cookie-less anon client, demo fallback, filters
    slugs.ts                   # slugify, MODEL_ROUTES, findModelBySlugs, modelPath
  ingestion/
    types.ts                   # SourceAdapter / RawMention / IngestQuery contracts
    adapters/{youtube,reddit,rss}.ts   # Official-API adapters, dormant without keys
    normalize.ts               # Rule-based mention→candidate rows (LLM extension point)
    pipeline.ts                # SOURCE_ADAPTERS registry + runIngestion (seed sync too)
  supabase/{client,server,config}.ts   # Browser/server clients, demo detection
  supabase/admin.ts            # Service-role client (server-only, null-safe)
  risk/riskScoring.ts          # Pure rule engine → ComponentRiskScore[]
  constants/{bikes,components}.ts      # Models + CANONICAL component taxonomy
  demo/data.ts                 # Demo bikes/services/symptoms (garage demo only)
  types.ts                     # DB row types incl. KnownIssue, ActionState
  utils.ts

scripts/
  generate-known-issues-sql.ts # TS seed → 005 SQL (npm run seed:sql)

supabase/migrations/
  001_initial_schema.sql       # Original tables + service-bills bucket
  002_rls_policies.sql         # Per-user RLS + storage policies
  003_seed_issue_clusters.sql  # LEGACY (superseded; optional)
  004_known_issues.sql         # Knowledge table, public-read RLS, natural key,
                               #   symptom component normalization
  005_seed_known_issues.sql    # GENERATED from TS seed (idempotent upsert)

proxy.ts                       # Next 16 middleware: Supabase session refresh
```

---

## 4. Data model

| Table            | Purpose | Access |
|------------------|---------|--------|
| `known_issues`   | Knowledge base: model/component/title/summary/severity + `service_checkpoint_km`, `mfg_year_start/end`, `rpm_band`, `symptoms_to_watch`, `preventive_action`, `typical_cost_min/max`, `mention_count`, `confidence_level`, `source_type`, `source_url`, `last_verified_at` | **Public read (anon+authed)**; writes only via service role |
| `profiles`       | name/phone/city | owner-only |
| `bikes`          | bike details incl. usage/modifications | owner-only |
| `service_logs`   | service visits, costs, `bill_file_url` | owner-only |
| `symptom_logs`   | rider-observed symptoms | owner-only |
| `issue_clusters` | **legacy** — no longer read by the app | authed read |

- Natural key `(source_type, brand, model, component, issue_title)` makes seed sync and ingestion
  upserts idempotent.
- Component taxonomy is canonical everywhere: `Engine`/`Cooling` merged into `Engine/Cooling`
  (migration 004 normalizes old symptom rows).
- Storage bucket `service-bills` (private), path-scoped to `auth.uid()`.

---

## 5. Data flow

1. **Public knowledge reads** — `getKnownIssues()` uses a **cookie-less** anon supabase-js client
   (keeps public pages statically renderable; `/models` is ISR-1h). Demo config → TS seed instead.
2. **Auth gate** — `requireUser()` only on the opt-in surfaces. Public pages never call it.
3. **Writes** — client forms (`useActionState`) → **server actions** in `app/actions/*` that
   validate, demo-check, insert/update under RLS, and `revalidatePath()`. Exception by design: bill
   files upload browser → Storage directly (RLS path), and only the storage path reaches the action.
4. **Delete my data** — server action removes storage files, logs, bikes, profile; deletes the auth
   user too when the service-role key exists; signs out and redirects.
5. **Ingestion** — `/api/ingest?source=…` (Bearer `INGEST_CRON_SECRET`/`CRON_SECRET`; 503 when
   unset) → `runIngestion()`: seed sync + configured adapters → `normalizeMentions()` →
   service-role upsert on the natural key. Never runs on user requests.
6. **Risk scoring** — unchanged pure rule engine over the rider's own bike/symptoms/services.

---

## 6. Invariants to preserve

1. **Browsing never forces login.** Public pages use `PublicShell` and must not touch `cookies()`.
2. **`known_issues` writes go through the service role only** — there are intentionally no RLS
   insert/update policies.
3. **Seed parity**: edit `lib/knowledge/seedKnownIssues.ts`, then `npm run seed:sql`; never edit
   005 by hand.
4. **Adapters stay dormant without keys** — builds and dev must succeed with zero env vars.
5. **Compliance**: official APIs/public feeds only; no Facebook/Instagram; provenance on every
   ingested row; disclaimer visible on public chrome.
6. Component taxonomy changes must update: constants, risk keywords, seed, normalize keywords.

---

## 7. How to run

```bash
npm install
npm run dev        # demo mode with no envs; see README for .env.local
npm run lint
npm run build
npm run seed:sql   # regenerate 005 after editing the TS seed
```
