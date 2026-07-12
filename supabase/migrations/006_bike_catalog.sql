-- 006: Reference catalogue of 300cc+ motorcycles sold in India.
-- Publicly readable; powers the model picker, /models, and library filters.
-- Distinct from public.bikes (a user's own tracked motorcycle).

create table if not exists public.bike_catalog (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  model text not null,
  engine_cc integer not null,
  body_type text not null,
  year_start integer not null,
  year_end integer,
  retail_band text not null,
  popular boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists bike_catalog_natural_key
  on public.bike_catalog (brand, model);

drop trigger if exists set_bike_catalog_updated_at on public.bike_catalog;
create trigger set_bike_catalog_updated_at
before update on public.bike_catalog
for each row execute function public.set_updated_at();

alter table public.bike_catalog enable row level security;

drop policy if exists "bike catalog is publicly readable" on public.bike_catalog;
create policy "bike catalog is publicly readable"
on public.bike_catalog for select
to anon, authenticated
using (true);

comment on table public.bike_catalog is
  'Reference list of premium (300cc+) motorcycles in India. Source of truth: lib/catalog/bikeCatalog.ts';
