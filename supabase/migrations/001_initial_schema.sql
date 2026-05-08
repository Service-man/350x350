create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  city text,
  created_at timestamptz default now()
);

create table if not exists public.bikes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  brand text not null,
  model text not null,
  variant text,
  manufacturing_year integer,
  purchase_year integer,
  odometer_km integer default 0,
  city text,
  usage_type text,
  has_modifications boolean default false,
  modification_notes text,
  fuel_type text default 'petrol',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.service_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  bike_id uuid references public.bikes(id) on delete cascade not null,
  service_date date not null,
  odometer_km integer not null,
  service_type text not null,
  garage_type text,
  garage_name text,
  city text,
  total_cost numeric,
  parts_replaced text,
  labor_cost numeric,
  notes text,
  bill_file_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.symptom_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  bike_id uuid references public.bikes(id) on delete cascade not null,
  symptom_date date not null,
  odometer_km integer,
  component text not null,
  symptom_title text not null,
  symptom_description text,
  severity text not null,
  frequency text,
  resolved boolean default false,
  linked_service_log_id uuid references public.service_logs(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.issue_clusters (
  id uuid primary key default gen_random_uuid(),
  bike_brand text not null,
  bike_model text not null,
  component text not null,
  issue_title text not null,
  issue_summary text,
  severity text not null,
  mileage_band text,
  mention_count integer default 0,
  trend_percentage numeric default 0,
  confidence_level text default 'low',
  source_type text default 'seed',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_bikes_updated_at on public.bikes;
create trigger set_bikes_updated_at
before update on public.bikes
for each row execute function public.set_updated_at();

drop trigger if exists set_service_logs_updated_at on public.service_logs;
create trigger set_service_logs_updated_at
before update on public.service_logs
for each row execute function public.set_updated_at();

drop trigger if exists set_symptom_logs_updated_at on public.symptom_logs;
create trigger set_symptom_logs_updated_at
before update on public.symptom_logs
for each row execute function public.set_updated_at();

drop trigger if exists set_issue_clusters_updated_at on public.issue_clusters;
create trigger set_issue_clusters_updated_at
before update on public.issue_clusters
for each row execute function public.set_updated_at();

insert into storage.buckets (id, name, public)
values ('service-bills', 'service-bills', false)
on conflict (id) do nothing;
