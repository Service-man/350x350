-- 004: Inform-first knowledge base.
-- known_issues supersedes issue_clusters: it carries provenance (source_url,
-- last_verified_at) and the dimensions the model intelligence pages render:
-- manufacturing window, service checkpoint, mileage band, and RPM band.
-- issue_clusters is kept for backward compatibility but is no longer read by
-- the app; new setups can skip 003_seed_issue_clusters.sql.

create table if not exists public.known_issues (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  model text not null,
  variant text,
  mfg_year_start integer,
  mfg_year_end integer,
  component text not null,
  issue_title text not null,
  issue_summary text,
  severity text not null default 'low',
  mileage_band text,
  service_checkpoint_km integer,
  rpm_band text,
  symptoms_to_watch text,
  preventive_action text,
  typical_cost_min numeric,
  typical_cost_max numeric,
  mention_count integer not null default 0,
  trend_percentage numeric not null default 0,
  confidence_level text not null default 'low',
  source_type text not null default 'seed',
  source_url text,
  last_verified_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Natural key used by the seed migration and the ingestion pipeline to make
-- upserts idempotent.
create unique index if not exists known_issues_natural_key
  on public.known_issues (source_type, brand, model, component, issue_title);

create index if not exists known_issues_model_idx
  on public.known_issues (brand, model);

drop trigger if exists set_known_issues_updated_at on public.known_issues;
create trigger set_known_issues_updated_at
before update on public.known_issues
for each row execute function public.set_updated_at();

alter table public.known_issues enable row level security;

-- The knowledge base is intentionally public: inform-first browsing must work
-- without an account. Writes happen only through the service role (ingestion
-- pipeline / seed sync), which bypasses RLS; no insert/update policies exist
-- on purpose.
drop policy if exists "known issues are publicly readable" on public.known_issues;
create policy "known issues are publicly readable"
on public.known_issues for select
to anon, authenticated
using (true);

-- Canonical component taxonomy: "Engine" and "Cooling" merge into
-- "Engine/Cooling" (matches the risk engine and health cards).
update public.symptom_logs
set component = 'Engine/Cooling'
where component in ('Engine', 'Cooling');

comment on table public.known_issues is
  'Model-wise known issue knowledge base with provenance. Supersedes issue_clusters.';
