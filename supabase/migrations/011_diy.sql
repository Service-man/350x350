-- 011: DIY guides + affiliate product links.
-- A curated collection, deliberately separate from known_issues so commercial
-- (Amazon affiliate) links never enter the neutral knowledge base. Publicly
-- readable when published; writes via the service role from /admin only.

create table if not exists public.diy_guides (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text,
  brand text,
  model text,
  component text,
  difficulty text not null default 'easy',
  estimated_time text,
  steps jsonb not null default '[]'::jsonb,
  status text not null default 'draft',
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists diy_guides_status_idx on public.diy_guides (status, published_at desc);
create index if not exists diy_guides_model_idx on public.diy_guides (brand, model);

-- Affiliate products belong to a guide. amazon_url is entered and controlled
-- from the admin panel; the app never scrapes Amazon.
create table if not exists public.diy_products (
  id uuid primary key default gen_random_uuid(),
  guide_id uuid not null references public.diy_guides (id) on delete cascade,
  title text not null,
  description text,
  amazon_url text not null,
  approx_price text,
  position integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists diy_products_guide_idx on public.diy_products (guide_id, position);

drop trigger if exists set_diy_guides_updated_at on public.diy_guides;
create trigger set_diy_guides_updated_at
before update on public.diy_guides
for each row execute function public.set_updated_at();

drop trigger if exists set_diy_products_updated_at on public.diy_products;
create trigger set_diy_products_updated_at
before update on public.diy_products
for each row execute function public.set_updated_at();

alter table public.diy_guides enable row level security;
alter table public.diy_products enable row level security;

drop policy if exists "published diy guides are public" on public.diy_guides;
create policy "published diy guides are public"
on public.diy_guides for select
to anon, authenticated
using (status = 'published');

-- Products are readable to anyone; they are only ever surfaced through a
-- published guide in the app. Writes remain service-role only.
drop policy if exists "diy products are public" on public.diy_products;
create policy "diy products are public"
on public.diy_products for select
to anon, authenticated
using (true);

comment on table public.diy_guides is
  'Curated DIY fixes with affiliate product links. Public read when published; writes via service role only.';
