-- 010: Blog engine.
-- Admin-authored editorial content, publicly readable when published. Writes
-- happen only through the service role from the /admin panel (email-allowlisted);
-- no public insert/update policies exist on purpose.

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  body_html text not null default '',
  cover_emoji text,
  tags text[] not null default '{}',
  author_name text,
  status text not null default 'draft',
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists blog_posts_status_idx on public.blog_posts (status, published_at desc);

drop trigger if exists set_blog_posts_updated_at on public.blog_posts;
create trigger set_blog_posts_updated_at
before update on public.blog_posts
for each row execute function public.set_updated_at();

alter table public.blog_posts enable row level security;

-- Published posts are public; drafts are invisible to anon/authenticated and
-- only reachable via the service-role admin client.
drop policy if exists "published blog posts are public" on public.blog_posts;
create policy "published blog posts are public"
on public.blog_posts for select
to anon, authenticated
using (status = 'published');

comment on table public.blog_posts is
  'Admin-authored blog posts. Public read when status = published; writes via service role only.';
