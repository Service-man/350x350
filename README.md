# 350x Garage

350x Garage is a rider-intelligence platform for 350cc+ motorcycles in India, built **inform-first**:
anyone can browse what typically goes wrong with their exact motorcycle — organized by **service
checkpoint (mileage)**, **manufacturing batch**, and **RPM band** — with symptoms to watch, preventive
actions, and rough repair-cost bands. No account needed to browse.

Tracking your own bike (garage, service logs with bill uploads, symptom logs, and rule-based component
risk scores) is an explicit **opt-in** behind "Track my bike" — never the front door.

All knowledge is labelled with a source type, confidence level, and last-verified date. These are early
indicators from curated research and public ownership reports, **not OEM-certified diagnostics**.

## Product surfaces

| Surface | Path | Auth |
|---|---|---|
| Landing + model picker | `/` | Public |
| Model library (all models) | `/models` | Public |
| Model intelligence (timeline / batch / RPM) | `/models/[brand]/[model]?year=` | Public |
| Bike Library (search + filters) | `/library` (old `/problem-radar` redirects here) | Public |
| DIY & Fixes (guides + affiliate parts) | `/diy`, `/diy/[slug]` | Public |
| Blog | `/blog`, `/blog/[slug]` | Public |
| Data sources & compliance | `/data-sources` — **temporarily hidden** (redirects to `/`; flip `DATA_SOURCES_HIDDEN` in `app/data-sources/page.tsx` to restore) | — |
| Dashboard, Garage, Service Logs, Symptoms, Health, Settings | `/dashboard` … | Opt-in (login) |
| Admin console (blog + DIY + affiliate links) | `/admin_con` … — **unlinked**; reachable only by typing the URL | Admin (email allowlist) |

## Tech stack

- Next.js App Router (v16) + React 19 + TypeScript
- Tailwind CSS
- Supabase: Postgres, Auth (email/password), Storage, Row Level Security
- lucide-react icons
- No paid APIs or services; ingestion uses only free official API tiers

## Local setup

```bash
npm install
npm run dev   # http://localhost:3000
```

Node.js `20.9.0+` (Node 22 recommended).

Without env vars the app boots in **demo mode**: the public knowledge pages render the curated
TypeScript seed, the logged-in area uses a demo dataset behind a fake cookie, and all writes are
disabled. This is what preview deployments show.

`.env.local` for a real backend:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key   # server-only: ingestion + account deletion

# Optional — ingestion stays dormant without these:
INGEST_CRON_SECRET=any_long_random_string          # enables POST/GET /api/ingest (CRON_SECRET also works)
YOUTUBE_API_KEY=...                                # YouTube Data API v3
REDDIT_CLIENT_ID=...                               # Reddit OAuth script app
REDDIT_CLIENT_SECRET=...
RSS_FEED_URLS=https://example.com/feed.xml,...     # comma-separated public feeds

# Optional — AI validation/enrichment stays dormant without this:
ANTHROPIC_API_KEY=...                              # enables the Claude validate + propose-fix pass
ANTHROPIC_MODEL=claude-opus-4-8                    # optional override (defaults to claude-opus-4-8)

# Optional — the /admin console: a logged-in user whose email is listed here gets admin:
ADMIN_EMAILS=you@example.com,editor@example.com    # comma-separated allowlist
```

Never expose `SUPABASE_SERVICE_ROLE_KEY`, the ingestion keys, or `ANTHROPIC_API_KEY` to the client.

## Supabase setup

Create a project, then run the SQL files from `supabase/migrations` in the SQL editor:

1. `001_initial_schema.sql` — profiles, bikes, service_logs, symptom_logs, legacy issue_clusters, `service-bills` bucket
2. `002_rls_policies.sql` — per-user RLS + storage policies
3. `003_seed_issue_clusters.sql` — **legacy, optional** (superseded by known_issues; harmless to skip)
4. `004_known_issues.sql` — the knowledge base table, publicly readable, with provenance columns
5. `005_seed_known_issues.sql` — curated known-issue seed (idempotent upsert)
6. `006_bike_catalog.sql` — the reference model catalogue table, publicly readable
7. `007_seed_bike_catalog.sql` — the 300cc+ India model catalogue seed (idempotent upsert)
8. `008_harden_function_search_path.sql` — pins the trigger function's search_path (security-linter fix)
9. `009_add_possible_solution.sql` — adds the `possible_solution` column the AI enrichment pass fills
10. `010_blog.sql` — `blog_posts` table (public read when published; admin-written)
11. `011_diy.sql` — `diy_guides` + `diy_products` tables (curated DIY fixes + Amazon affiliate links)

The catalogue (`lib/catalog/bikeCatalog.ts`) and the known-issue seed (`lib/knowledge/seedKnownIssues.ts`)
are the single sources of truth; run `npm run seed:sql` to regenerate `005` and `007` after editing them.

Bill files upload to the private `service-bills` bucket under `{user_id}/{bike_id}/{timestamp}-{filename}`;
storage policies restrict access to the owner's folder.

## The knowledge model

`known_issues` is the core table. Beyond title/summary/severity it carries:

- `service_checkpoint_km` — groups issues into the model page's mileage timeline
- `mfg_year_start` / `mfg_year_end` — manufacturing-window (batch) issues
- `rpm_band` — rev-specific behaviour (buzz zones, fan cycles)
- `symptoms_to_watch`, `preventive_action`, `possible_solution`, `typical_cost_min/max` (₹)
- Provenance: `source_type`, `source_url`, `confidence_level`, `mention_count`, `last_verified_at`

**Editing seed content:** edit `lib/knowledge/seedKnownIssues.ts` (single source of truth), then run
`npm run seed:sql` to regenerate `005_seed_known_issues.sql`. Never edit the generated SQL by hand.
The same TS seed renders directly in demo mode, and `/api/ingest?source=seed` re-syncs it into the DB
without re-running migrations.

## Editorial: blog, DIY & the admin console

Two admin-authored surfaces sit alongside the knowledge base, both managed from `/admin_con`
(deliberately unlinked from all navigation — reach it by typing the URL):

- **Blog** (`/blog`) — long-form posts written in a WYSIWYG editor (Tiptap). Body HTML is sanitized
  (DOMPurify, tag-allowlisted) on save, then rendered in the site's article style.
- **DIY & Fixes** (`/diy`) — curated do-it-yourself guides (steps + difficulty + time) with **Amazon
  affiliate product links**. Product links are entered and edited entirely from the admin panel (the app
  never scrapes Amazon), rendered with `rel="sponsored nofollow noopener"` and a clear Amazon Associates
  disclosure. Affiliate content lives in its own tables (`diy_guides` / `diy_products`), deliberately
  separate from the neutral `known_issues` knowledge base.

**Admin access** is an **email allowlist**: a logged-in user whose email is in `ADMIN_EMAILS`
(comma-separated) reaches `/admin`; everyone else is redirected. Writes go through the service-role
client, so they require the Supabase env vars — in demo mode the console is viewable but read-only.
Blog posts and DIY guides both have `draft`/`published` states; only published items appear publicly.
A fresh database (or demo mode) shows a curated seed (incl. the E20-vs-petrol post) until real content
is published.

## Ingestion (off by default)

`lib/ingestion/` is a pluggable adapter layer. Each source implements the same `SourceAdapter`
interface and stays **dormant (no network) until its env keys exist**:

- **YouTube Data API** (`YOUTUBE_API_KEY`) — official API, video titles/descriptions
- **Reddit API** (`REDDIT_CLIENT_ID/SECRET`) — official OAuth, public posts
- **RSS/Atom** (`RSS_FEED_URLS`) — public feeds whose terms permit reuse

Raw mentions flow through `normalize.ts` (deterministic, rule-based: component classification,
mileage/RPM inference, conservative severity) into candidate rows with a public source URL each.

**AI validation & enrichment (`lib/ingestion/llm/`, dormant without `ANTHROPIC_API_KEY`):** each
candidate is reviewed by Claude before it can enter `known_issues`. The model confirms whether the
pattern is a real, model-specific issue, rewrites the title/summary, sets a conservative severity, and
proposes a concrete fix (`possible_solution`). Rejected noise is dropped; curated seed rows are never
deleted. Its structured output is re-validated against a Zod schema (`IssueValidationSchema`) before
anything is written. Without the key, ingestion still runs with the deterministic rows only.

**Bounded contracts (`lib/ingestion/contracts.ts`):** every value crossing an edge — an adapter's raw
mention, the LLM's structured answer, a row headed for the database, and the `/api/ingest`
request/response — is parsed against a Zod schema, so malformed data fails at the boundary instead of
corrupting the knowledge base.

Runs happen only as a batch via the secret-protected endpoint (never per user request):

```bash
curl -X POST -H "Authorization: Bearer $INGEST_CRON_SECRET" \
  "https://your-app.vercel.app/api/ingest?source=all"
# source=all | seed | youtube | reddit | rss | reprocess
# reprocess = re-validate & enrich existing rows that have no proposed fix yet (bounded batch)
```

**Scheduled monthly** via `vercel.json` → `crons` (`0 3 1 * *`, 03:00 UTC on the 1st). Vercel Cron
sends `Authorization: Bearer $CRON_SECRET`, so set `CRON_SECRET` in project env to enable the schedule:

```json
{ "crons": [{ "path": "/api/ingest?source=all", "schedule": "0 3 1 * *" }] }
```

**Compliance stance:** official APIs and public feeds only; robots.txt, rate limits, and ToS
respected; **no Facebook/Instagram scraping, ever**; no login-walled scraping; every ingested claim
stores provenance; the AI pass is instructed never to fabricate figures, dates, or prices.
`/data-sources` shows the live/dormant status of each adapter and the AI validation pass.

## Deployment (Vercel)

1. Push to GitHub and import into Vercel.
2. Add the Supabase env vars (and optional ingestion vars) in Project Settings.
3. Run the migrations before first production use.
4. Deploy with the default build (`npm run build`).

## Known limitations

- Risk scores are rule-based early indicators, not diagnostics or ML predictions.
- Ingestion normalization is keyword-based v0; when `ANTHROPIC_API_KEY` is set the Claude validation
  pass refines those community rows and proposes fixes, but the LLM does not yet do cross-source
  clustering (it reviews one candidate at a time).
- No OCR on bills; files are stored privately and served via short-lived signed URLs.
- Seed content is curated from public ownership patterns and labelled with conservative confidence;
  it should be reviewed and expanded continuously.

## Roadmap

- LLM-based cross-source clustering (the per-candidate validation/enrichment pass already ships)
- OEM recall/service-bulletin adapter (`source_type: 'oem'`)
- Consent-first anonymized aggregation of rider logs into the public knowledge base
- OCR extraction from service bills
- Component lifecycle prediction once enough labelled service/failure data exists
- Mechanic/dealer dashboard; used-bike inspection report
