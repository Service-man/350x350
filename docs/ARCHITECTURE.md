# 350x Garage — Architecture & Codebase Map

_Last reviewed: 2026-07-07 (branch `claude/350x-garage-structure-dvuxen`)_

This document describes the repository **as it exists today** so anyone (human or
model) can pick it up quickly. A separate document, `docs/REFINEMENT_PROMPT.md`,
describes where the product is going next.

---

## 1. What the app is today

350x Garage is a **Next.js 16 (App Router) + Supabase** MVP for 350cc+
motorcycles in India. Today it is a **first-party logging tool**: a signed-in
rider adds their bikes, logs service visits (with bill uploads), logs symptoms,
and sees (a) a small seed "Problem Radar" of known model issues and (b) a
rule-based "component risk score" computed from their own logs.

It also ships a **demo mode**: when Supabase env vars are absent (the current
hosted state), every page renders from a hardcoded demo dataset and auth is a
fake cookie. This is why the deployed preview "works" without a database, but no
writes persist.

---

## 2. Tech stack

| Layer      | Choice |
|------------|--------|
| Framework  | Next.js `^16.2.6`, App Router, React 19, Server Components |
| Language   | TypeScript (`strict`) |
| Styling    | Tailwind CSS 3, custom theme tokens (`ink`, `leaf`, `paper`, …) |
| Backend    | Supabase — Postgres, Auth (email/password), Storage, RLS |
| SSR auth   | `@supabase/ssr` cookie-based client |
| Icons      | `lucide-react` |
| Build      | `next build --webpack` (Turbopack opted out) |
| Hosting    | Vercel (`vercel.json`) |

Cost posture: near-zero. No paid APIs, no third-party services.

---

## 3. Directory structure

```
app/                        # App Router pages (all server components unless noted)
  page.tsx                  # Public landing page
  login/ signup/            # Auth screens (render <AuthForm/>)
  dashboard/                # Stat cards + top issues + risk summary
  garage/                   # Add/edit bikes + bike cards
  service-logs/             # Service log form + table + signed bill links
  symptoms/                 # Symptom form + filterable list
  problem-radar/            # Seed issue clusters w/ model/component/text filters
  health/                   # Rule-based component risk score cards
  data-sources/             # Static "ingestion roadmap" cards
  settings/                 # Profile, logout, privacy note, delete placeholder
  layout.tsx  globals.css   # Root layout + Tailwind layer + component classes

components/                 # Presentational + client form components
  AppShell.tsx Sidebar.tsx  # Chrome: fixed left nav + header
  AuthForm.tsx              # "use client" — login/signup + demo fallback
  BikeForm.tsx              # "use client" — insert/update bikes
  ServiceLogForm.tsx        # "use client" — insert service log + Storage upload
  SymptomForm.tsx           # "use client" — insert symptom log
  BikeCard StatCard RiskScoreCard IssueClusterCard EmptyState LoadingState LogoutButton

lib/
  supabase/client.ts        # Browser client (createBrowserClient)
  supabase/server.ts        # Server client + getUser()/requireUser() (+ demo user)
  supabase/config.ts        # isDemoSupabaseConfig() + DEMO_SESSION_COOKIE
  risk/riskScoring.ts       # Pure rule engine → ComponentRiskScore[]
  constants/bikes.ts        # Models, usage/service/garage types, severities
  constants/components.ts   # COMPONENT_OPTIONS + HEALTH_COMPONENTS
  demo/data.ts              # Hardcoded demo bikes/logs/symptoms/issues
  types.ts                  # Core DB row types
  utils.ts                  # cn(), formatInr(), formatKm(), titleCase(), parseNumber()

supabase/migrations/
  001_initial_schema.sql    # Tables, updated_at triggers, service-bills bucket
  002_rls_policies.sql      # Row Level Security + storage object policies
  003_seed_issue_clusters.sql # 8 seed issue rows

proxy.ts                    # Next 16 request middleware (Supabase session refresh)
```

---

## 4. Data model (Postgres via Supabase)

| Table            | Purpose | Ownership |
|------------------|---------|-----------|
| `profiles`       | `id → auth.users`, name/phone/city | owner-only (RLS) |
| `bikes`          | brand, model, variant, years, odometer, city, usage_type, modifications, fuel_type | owner-only |
| `service_logs`   | date, odometer, type, garage, costs, parts, notes, `bill_file_url` | owner-only |
| `symptom_logs`   | date, odometer, component, title/desc, severity, frequency, resolved, `linked_service_log_id` | owner-only |
| `issue_clusters` | brand/model/component/title/summary, severity, mileage_band, mention_count, trend_%, confidence, source_type | **authenticated read** |

- `updated_at` maintained by a shared `set_updated_at()` trigger on the four
  mutable tables.
- Storage bucket `service-bills` (private). Path convention
  `{user_id}/{bike_id}/{timestamp}-{filename}`; access gated so the first path
  segment must equal `auth.uid()`.
- RLS is comprehensive and correct: per-user select/insert/update/delete on
  bikes/logs/symptoms, and insert policies additionally verify the referenced
  bike belongs to the user.

---

## 5. Request & data flow

1. **Auth** — `AuthForm` (client) calls Supabase `signInWithPassword`/`signUp`.
   On signup it upserts a `profiles` row. `requireUser()` (server) redirects to
   `/login` when there is no session.
2. **Demo fallback** — `isDemoSupabaseConfig()` returns true when env vars are
   missing/placeholder. In that case: `AuthForm` sets a `garage_demo_session`
   cookie and routes to `/dashboard`; `getUser()` returns a fixed demo user;
   every page substitutes `lib/demo/data.ts` for DB reads; all write forms
   short-circuit with a "demo mode is read-only" message.
3. **Reads** — pages are server components that, when not in demo mode, run
   parallel `supabase.from(...).select()` scoped by `user_id` (RLS also
   enforces this).
4. **Writes** — forms are `"use client"` and call Supabase directly from the
   browser (`insert`/`update`), then `router.refresh()`.
5. **Risk scoring** — `calculateRiskScores(bike, symptoms, services)` is a pure
   function producing 6 component scores (Battery, Chain/Sprocket, Brake Pads,
   Clutch, Engine/Cooling, Tyres), each 0–100 with `Low/Medium/High`, reasons,
   and a recommended action. Consumed by `/health` and `/dashboard`.

---

## 6. Notable observations & technical debt

These are worth addressing during refinement (the refinement prompt covers
them):

1. **Component taxonomy is inconsistent.**
   `COMPONENT_OPTIONS` lists **Engine** and **Cooling** separately, but
   `HEALTH_COMPONENTS`, the risk engine, and the seed data use the combined
   **Engine/Cooling**. `problem-radar/page.tsx` even hardcodes an extra
   `<option>Engine/Cooling</option>` after mapping `COMPONENT_OPTIONS`. Unify to
   one canonical taxonomy.

2. **`proxy.ts` middleware — verify it runs.** The file is named `proxy.ts` and
   exports `proxy` with a `config.matcher` (Next 16 convention). It early-returns
   in demo mode, so session refresh is untested against real Supabase. Confirm
   Next actually invokes it before relying on cookie refresh in production.

3. **`issue_clusters` has no provenance.** No `source_url`, no `last_verified_at`,
   no manufacturing-window or RPM dimension. This is fine for 8 seed rows but is
   the central gap for the "inform-first" pivot.

4. **Read access requires auth.** `issue_clusters` RLS is `to authenticated`.
   For an inform-first product, the knowledge base should be browsable by
   anonymous visitors.

5. **Dead placeholders.** Dashboard "Maintenance trend: Soon", `data-sources`
   page is static marketing, settings "Delete my data" is a disabled button,
   `parseNumber`/`LoadingState` are defined but unused.

6. **Writes happen client-side.** Forms talk to Supabase from the browser rather
   than through server actions/route handlers. It works under RLS but centralizes
   nothing (validation, provenance, revalidation) server-side.

7. **Landing page leads with capture.** Primary CTA is "Add my bike" — the exact
   friction the product owner now wants to remove.

---

## 7. How to run

```bash
npm install
cp .env.local.example .env.local   # (create it; see below)
npm run dev                          # http://localhost:3000
```

`.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...        # server-only, never sent to client
```

Without these, the app boots in **demo mode**. With them, run the three SQL
migrations in `supabase/migrations/` in order, then sign up.
