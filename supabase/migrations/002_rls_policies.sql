-- 002: Row Level Security policies.
-- Every policy is dropped before it is created so this file is idempotent and
-- can be re-run safely (Postgres has no CREATE POLICY IF NOT EXISTS, and a
-- bare CREATE fails with "policy already exists" on a second run).

alter table public.profiles enable row level security;
alter table public.bikes enable row level security;
alter table public.service_logs enable row level security;
alter table public.symptom_logs enable row level security;
alter table public.issue_clusters enable row level security;

-- ── profiles ────────────────────────────────────────────────────────────────
drop policy if exists "profiles are owned by user" on public.profiles;
create policy "profiles are owned by user"
on public.profiles for select
to authenticated
using (auth.uid() = id);

drop policy if exists "users insert own profile" on public.profiles;
create policy "users insert own profile"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- ── bikes ───────────────────────────────────────────────────────────────────
drop policy if exists "users read own bikes" on public.bikes;
create policy "users read own bikes"
on public.bikes for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "users insert own bikes" on public.bikes;
create policy "users insert own bikes"
on public.bikes for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "users update own bikes" on public.bikes;
create policy "users update own bikes"
on public.bikes for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "users delete own bikes" on public.bikes;
create policy "users delete own bikes"
on public.bikes for delete
to authenticated
using (auth.uid() = user_id);

-- ── service_logs ────────────────────────────────────────────────────────────
drop policy if exists "users read own service logs" on public.service_logs;
create policy "users read own service logs"
on public.service_logs for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "users insert own service logs" on public.service_logs;
create policy "users insert own service logs"
on public.service_logs for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.bikes
    where bikes.id = service_logs.bike_id
    and bikes.user_id = auth.uid()
  )
);

drop policy if exists "users update own service logs" on public.service_logs;
create policy "users update own service logs"
on public.service_logs for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "users delete own service logs" on public.service_logs;
create policy "users delete own service logs"
on public.service_logs for delete
to authenticated
using (auth.uid() = user_id);

-- ── symptom_logs ────────────────────────────────────────────────────────────
drop policy if exists "users read own symptom logs" on public.symptom_logs;
create policy "users read own symptom logs"
on public.symptom_logs for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "users insert own symptom logs" on public.symptom_logs;
create policy "users insert own symptom logs"
on public.symptom_logs for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.bikes
    where bikes.id = symptom_logs.bike_id
    and bikes.user_id = auth.uid()
  )
);

drop policy if exists "users update own symptom logs" on public.symptom_logs;
create policy "users update own symptom logs"
on public.symptom_logs for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "users delete own symptom logs" on public.symptom_logs;
create policy "users delete own symptom logs"
on public.symptom_logs for delete
to authenticated
using (auth.uid() = user_id);

-- ── issue_clusters (legacy) ─────────────────────────────────────────────────
drop policy if exists "authenticated users read issue clusters" on public.issue_clusters;
create policy "authenticated users read issue clusters"
on public.issue_clusters for select
to authenticated
using (true);

-- ── storage: service-bills bucket, scoped to the owner's folder ─────────────
drop policy if exists "users upload own service bills" on storage.objects;
create policy "users upload own service bills"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'service-bills'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "users read own service bills" on storage.objects;
create policy "users read own service bills"
on storage.objects for select
to authenticated
using (
  bucket_id = 'service-bills'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "users update own service bills" on storage.objects;
create policy "users update own service bills"
on storage.objects for update
to authenticated
using (
  bucket_id = 'service-bills'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "users delete own service bills" on storage.objects;
create policy "users delete own service bills"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'service-bills'
  and (storage.foldername(name))[1] = auth.uid()::text
);
