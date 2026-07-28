import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/PublicShell";
import { getPublishedPosts } from "@/lib/blog/getBlog";

export const metadata: Metadata = {
  title: "Blog — 350x Garage",
  description: "Level-headed reads on owning a 300cc+ motorcycle in India — fuel, service, and real-world reliability."
};

export const dynamic = "force-dynamic";

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}

export default async function BlogIndex() {
  const posts = await getPublishedPosts();
  const [lead, ...rest] = posts;

  return (
    <PublicShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8 max-w-3xl">
          <p className="eyebrow mb-3">The garage journal</p>
          <h1 className="text-4xl font-black tracking-[-0.03em] text-ink">Blog</h1>
          <p className="mt-2 text-sm leading-6 text-steel">
            Level-headed reads on owning a 300cc+ motorcycle in India — fuel, service intervals, and
            real-world reliability. No hype, no jargon.
          </p>
        </header>

        {posts.length === 0 ? (
          <p className="panel text-sm text-steel">No posts yet — check back soon.</p>
        ) : (
          <>
            {lead ? (
              <Link
                href={`/blog/${lead.slug}`}
                className="group mb-8 grid gap-6 rounded-xl border border-stone-200 bg-white p-6 shadow-soft transition hover:border-leaf md:grid-cols-[120px_1fr] md:p-8"
              >
                <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-ink text-5xl">
                  {lead.cover_emoji ?? "📝"}
                </div>
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    {lead.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="rounded-full bg-mint px-2.5 py-0.5 text-[11px] font-bold text-leaf">{tag}</span>
                    ))}
                    <span className="font-mono text-[11px] uppercase text-lavmute">{formatDate(lead.published_at)}</span>
                  </div>
                  <h2 className="text-2xl font-black tracking-[-0.02em] text-ink group-hover:text-leaf">{lead.title}</h2>
                  {lead.excerpt ? <p className="mt-2 text-sm leading-6 text-steel">{lead.excerpt}</p> : null}
                  <p className="mt-3 text-[13px] font-bold text-leaf">Read the article →</p>
                </div>
              </Link>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {rest.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col rounded-xl border border-stone-200 bg-white p-5 shadow-soft transition hover:border-leaf"
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-ink text-2xl">
                    {post.cover_emoji ?? "📝"}
                  </div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="rounded-full bg-mint px-2 py-0.5 text-[10.5px] font-bold text-leaf">{tag}</span>
                    ))}
                  </div>
                  <h3 className="font-extrabold text-ink group-hover:text-leaf">{post.title}</h3>
                  {post.excerpt ? <p className="mt-1.5 line-clamp-3 text-[13px] leading-6 text-steel">{post.excerpt}</p> : null}
                  <span className="mt-auto pt-3 font-mono text-[11px] uppercase text-lavmute">{formatDate(post.published_at)}</span>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </PublicShell>
  );
}
