-- 012: Kundli chat + riding profile.
-- The "kundli" is the app's main surface: a chat that reads a rider's service
-- bills, asks riding-pattern questions, and predicts which parts are likely to
-- need attention. Everything here is idempotent and owner-scoped under RLS.

-- Riding pattern lives on the bike (it describes the rider+machine, not one
-- service visit). Stored as JSON so new questions never need a migration.
alter table public.bikes
  add column if not exists riding_profile jsonb not null default '{}'::jsonb;

-- "Which service was this?" — 1st..5th, or post-5th.
alter table public.service_logs
  add column if not exists service_number text;

-- Note-first symptoms: the system deduces the likely upcoming problem.
alter table public.symptom_logs
  add column if not exists predicted_issue text;

-- ── Chat history ────────────────────────────────────────────────────────────
create table if not exists public.kundli_chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  bike_id uuid references public.bikes(id) on delete set null,
  title text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.kundli_messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.kundli_chats(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  attachment_name text,
  -- Structured side-channel: an extracted bill draft, the question the
  -- assistant asked (so a chip answer can be applied), and quick-reply chips.
  meta jsonb,
  created_at timestamptz default now()
);

create index if not exists kundli_chats_user_idx on public.kundli_chats (user_id, updated_at desc);
create index if not exists kundli_messages_chat_idx on public.kundli_messages (chat_id, created_at);

drop trigger if exists set_kundli_chats_updated_at on public.kundli_chats;
create trigger set_kundli_chats_updated_at
before update on public.kundli_chats
for each row execute function public.set_updated_at();

alter table public.kundli_chats enable row level security;
alter table public.kundli_messages enable row level security;

drop policy if exists "users read own kundli chats" on public.kundli_chats;
create policy "users read own kundli chats"
on public.kundli_chats for select to authenticated using (auth.uid() = user_id);

drop policy if exists "users insert own kundli chats" on public.kundli_chats;
create policy "users insert own kundli chats"
on public.kundli_chats for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "users update own kundli chats" on public.kundli_chats;
create policy "users update own kundli chats"
on public.kundli_chats for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "users delete own kundli chats" on public.kundli_chats;
create policy "users delete own kundli chats"
on public.kundli_chats for delete to authenticated using (auth.uid() = user_id);

drop policy if exists "users read own kundli messages" on public.kundli_messages;
create policy "users read own kundli messages"
on public.kundli_messages for select to authenticated using (auth.uid() = user_id);

drop policy if exists "users insert own kundli messages" on public.kundli_messages;
create policy "users insert own kundli messages"
on public.kundli_messages for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "users delete own kundli messages" on public.kundli_messages;
create policy "users delete own kundli messages"
on public.kundli_messages for delete to authenticated using (auth.uid() = user_id);

comment on table public.kundli_chats is 'Kundli chat sessions (owner-scoped).';
comment on table public.kundli_messages is 'Kundli chat messages; meta carries extracted bill drafts, asked fields, and chips.';
