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

  return (
    <PublicShell>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
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
          <div className="divide-y divide-stone-200 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-soft">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex items-center gap-4 px-5 py-4 transition hover:bg-paper"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink text-xl">
                  {post.cover_emoji ?? "📝"}
                </span>
                <span className="min-w-0 flex-1 truncate font-extrabold text-ink group-hover:text-leaf">
                  {post.title}
                </span>
                <span className="hidden shrink-0 items-center gap-1.5 md:flex">
                  {post.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="rounded-full bg-mint px-2.5 py-0.5 text-[11px] font-bold text-leaf">
                      {tag}
                    </span>
                  ))}
                </span>
                <span className="hidden shrink-0 font-mono text-[11px] uppercase text-lavmute sm:block">
                  {formatDate(post.published_at)}
                </span>
                <span className="shrink-0 text-[13px] font-bold text-leaf">→</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PublicShell>
  );
}
