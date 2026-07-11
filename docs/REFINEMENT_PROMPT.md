# 350x Garage — Refinement Prompt for Fable 5

> Paste everything below the line into Fable 5 (or Claude Code) with this repo
> attached. It assumes the codebase described in `docs/ARCHITECTURE.md`. It is a
> **refactor + extend** brief, not a greenfield build — reuse what exists.

---

You are an expert full-stack product engineer. You are evolving an existing
Next.js 16 + Supabase MVP called **350x Garage** (rider intelligence for 350cc+
motorcycles in India). The codebase already builds and runs; do not rewrite it
from scratch. Read `docs/ARCHITECTURE.md` first, then make the changes below.

## The strategic pivot (read this carefully — it changes the product's shape)

The MVP was built **capture-first**: it asks a rider to sign up and log their
bikes, service bills, and symptoms before giving them anything. Real usage shows
this is backwards — **new riders will not hand over that data before they trust
the product**. So the product is being re-centered:

**Inform first. Capture later, and only on request.**

The primary job of the app is now to **educate a rider about what will likely go
wrong with their specific motorcycle** — by model, variant, manufacturing
year/batch, mileage band, and even RPM range — sourced from aggregated public
community and web knowledge, **before asking them for anything**. The logging
features (garage, service logs, symptoms) become **opt-in "power-user" tools**
gated behind an explicit "start tracking" action, not the front door.

Concretely, a first-time visitor should be able to, **without logging in**:
1. Pick their brand + model (+ optionally variant/year).
2. Immediately see that model's known problems, organized by **service/mileage
   checkpoint** ("what to watch for at 5,000 / 10,000 / 20,000 km"), plus
   **manufacturing-window-specific** issues ("2021–2022 batch: …") and
   **RPM-band** issues ("vibration / clutch drag around 4,000–5,000 rpm"),
   each with symptoms to watch, a preventive action, a rough repair-cost band,
   and a source/confidence label.
3. Optionally choose "Track my bike" — which is where auth + the existing
   capture forms kick in.

## Hard constraints (unchanged from the original build)

- Keep infra cost **near zero**. No paid APIs in this version. Web app, not
  mobile.
- **Data sourcing must be compliant.** Prefer, in this order: official APIs
  (YouTube Data API, Reddit API), public RSS/Atom feeds, OEM recall/service
  bulletins, and clearly-public forum pages that permit it. Respect
  `robots.txt`, rate limits, and Terms of Service. **Do NOT scrape Facebook or
  Instagram**, and do not build login-walled or ToS-violating scrapers. Store a
  `source_url` and `last_verified_at` for every ingested claim so provenance is
  auditable. Curated/seed data remains the trustworthy fallback.
- All model-generated or ingested "issues" are **early indicators, not
  OEM-certified diagnostics** — keep that disclaimer visible. Risk stays
  rule-based, not ML.
- Clean architecture, no overengineering, correctness over animation.
- Keep the stack: Next.js 16 App Router, TypeScript, Tailwind, Supabase,
  lucide-react.

---

## Work items

### A. Re-architect the information architecture (inform-first)

1. **Landing page (`app/page.tsx`)** — lead with the knowledge, not the form.
   - Primary CTA: **"See problems for my bike"** → model picker → public model
     page (below). No login required.
   - Secondary CTA: **"Track my bike"** (the opt-in capture path) → login.
   - Keep the disclaimer.
2. **New public model intelligence page** — e.g. `app/models/[brand]/[model]/page.tsx`
   (or a `/library` browse + detail). Server component, **works logged-out**.
   Given a model (and optional `?variant=`/`?year=`), render:
   - A **maintenance timeline / "what to expect"** view: mileage/service
     checkpoints (e.g. 500, 5k, 10k, 20k, 30k km) with the issues typically seen
     around each, and preventive actions.
   - **Manufacturing-window issues** (year/batch-specific).
   - **RPM-band issues** where known.
   - Each issue card: title, component, severity, symptoms-to-watch, preventive
     action, typical repair-cost band (₹), mention/confidence, and a source link.
3. **Rework Problem Radar (`/problem-radar`)** into the public browse/search
   surface over this knowledge base (rename in nav to something like
   **"Bike Library"** or **"Model Intelligence"** if it reads better). Filters:
   brand, model, component, mileage band, severity, free-text.
4. **Gate the capture features behind an explicit opt-in.** Garage, Service
   Logs, and Symptoms move behind a "Track my bike" flow (auth + a per-user
   `tracking_enabled` flag or simply the existing auth gate, but never the
   default landing). Browsing the library must never force login.
5. Update `Sidebar`/`AppShell` so the logged-out experience (library, model
   pages) and the logged-in "my garage" experience are clearly separated.

### B. Expand the knowledge model (the core of the pivot)

Add a Supabase migration (`004_knowledge_model.sql`) that evolves
`issue_clusters` into a richer, provenance-carrying knowledge base. Either extend
the table or introduce a `known_issues` table — your call — with at least:

```
brand text, model text, variant text null,
mfg_year_start int null, mfg_year_end int null,   -- manufacturing window
component text,                                    -- canonical taxonomy (see D)
issue_title text, issue_summary text,
severity text,
mileage_band text null,                            -- e.g. '5,000-10,000 km'
service_checkpoint_km int null,                    -- for timeline grouping
rpm_band text null,                                -- e.g. '4,000-5,000 rpm'
symptoms_to_watch text null,
preventive_action text null,
typical_cost_min numeric null, typical_cost_max numeric null,
mention_count int, trend_percentage numeric, confidence_level text,
source_type text,                                  -- 'seed' | 'youtube' | 'reddit' | 'rss' | 'oem' | 'community'
source_url text null, last_verified_at timestamptz null,
created_at, updated_at
```

- Make this table **publicly readable** (RLS `to anon, authenticated using
  (true)`), since inform-first browsing must work without auth.
- Replace `003_seed_issue_clusters.sql`'s 8 thin rows with a **substantially
  richer curated seed** (`005_seed_known_issues.sql`) covering the target models
  (RE Classic 350, Meteor 350, Hunter 350, Himalayan 450, Honda CB350, KTM Duke
  390, Triumph Speed 400) across multiple mileage checkpoints and, where you can
  responsibly assert it, manufacturing-window and RPM notes. Curated seed is the
  ground truth; ingestion augments it later.

### C. Build a pluggable, compliant ingestion layer (scaffold now, wire later)

Create `lib/ingestion/` with a clean adapter architecture so sources can be
added without touching consumers:

- `lib/ingestion/types.ts` — a `SourceAdapter` interface, e.g.
  `{ id, fetchRaw(query): Promise<RawMention[]>, }` and a `RawMention` shape
  (text, url, author-less, publishedAt, sourceType).
- `lib/ingestion/adapters/` — one file per source: `youtube.ts`, `reddit.ts`,
  `rss.ts` (and a `seed.ts`). Implement them behind the interface but keep
  network calls **feature-flagged / no-op until API keys are present** so the
  build never depends on external services or paid APIs.
- `lib/ingestion/normalize.ts` — turns `RawMention[]` into candidate
  `known_issues` rows: classify component (canonical taxonomy), infer mileage/RPM
  band when stated, summarize, and attach `source_url` + confidence. This is the
  step a future LLM pass can improve; keep it deterministic/rule-based for now
  with a clear extension point.
- **Scheduling:** run ingestion as a batch job, not per-request. Provide a
  Vercel Cron route (`app/api/ingest/route.ts`, protected by a secret) or a
  GitHub Actions workflow that calls it, writing results to Supabase via the
  **service role key server-side only**. Document that it's off by default.
- Add clear provenance + a "how we source data" note on `/data-sources`
  (replace the static marketing with the real, compliant source list and their
  live/off status).

### D. Pay down the debt found in review

1. **Unify the component taxonomy.** Pick one canonical list (recommend merging
   to `Engine/Cooling`, keeping `Electrical` distinct) and use it everywhere:
   `constants/components.ts`, `COMPONENT_OPTIONS`, `HEALTH_COMPONENTS`, the risk
   engine, seed data, and filters. Remove the hardcoded extra `Engine/Cooling`
   `<option>` in `problem-radar/page.tsx`.
2. **Verify `proxy.ts` is actually invoked** as Next 16 middleware and that
   Supabase session refresh works against a real project; fix or rename if not.
3. **Replace dead placeholders:** either implement the dashboard "Maintenance
   trend" from the user's own `service_logs` (monthly cost trend) or drop the
   card; implement or clearly label the settings "Delete my data" action.
4. **Move writes to server actions / route handlers** where practical, so
   validation, provenance stamping, and `revalidatePath` live server-side
   instead of in client components talking directly to Supabase.
5. Keep demo mode working (it's a good preview affordance), but ensure the
   **public library renders real seed data without any login or demo cookie**.

### E. Docs & housekeeping

- Update `README.md`: new product framing (inform-first), the knowledge model,
  how ingestion works and how to enable a source, and the compliance stance.
- Keep migrations ordered and idempotent (`create table if not exists`,
  `on conflict do nothing`). Add any new env vars (e.g. `YOUTUBE_API_KEY`,
  `REDDIT_CLIENT_ID`, `INGEST_CRON_SECRET`) to the README, all optional.

---

## Non-goals (do not do these)

- No Facebook/Instagram scraping; no ToS-violating or login-walled scraping.
- No ML / predictive-maintenance claims; risk stays rule-based and clearly
  labelled as an early indicator.
- No paid third-party services; the app must still build and run with zero
  external keys (ingestion simply stays dormant).
- No mobile app; no OBD integration in this pass (leave the seam for later).

## Acceptance criteria

- A logged-out visitor can pick a bike model and see a mileage-checkpoint
  timeline of known issues, plus manufacturing-window and RPM notes where
  present, each with symptoms, preventive action, cost band, and a source label.
- The knowledge base is publicly readable; capture features (garage/service/
  symptoms) are reachable only via an explicit "Track my bike" opt-in.
- `issue_clusters`/`known_issues` carries `source_url`, `last_verified_at`, and
  the new mileage/RPM/mfg-window dimensions, with a richer curated seed.
- An ingestion adapter layer exists with at least YouTube, Reddit, and RSS
  adapters behind a common interface, dormant without keys, plus a
  secret-protected batch endpoint. No network dependency at build time.
- Component taxonomy is consistent across constants, risk engine, seed, and
  filters; the duplicate radar option is gone.
- `npm run build` and `npm run dev` succeed with **no** Supabase/API env vars
  (demo + public library both render), and also with real ones.
- README reflects the new architecture and compliance posture.

Prioritize correctness, a clean adapter/knowledge architecture, and a genuinely
useful logged-out experience over visual polish. Reuse existing components,
types, and Tailwind tokens.
