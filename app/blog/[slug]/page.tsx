import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PublicShell } from "@/components/PublicShell";
import { getPostBySlug, getPublishedPosts } from "@/lib/blog/getBlog";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Blog — 350x Garage" };
  return {
    title: `${post.title} — 350x Garage`,
    description: post.excerpt ?? undefined
  };
}

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
}

export default async function BlogArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const related = (await getPublishedPosts()).filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <PublicShell>
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-steel transition hover:text-leaf">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All posts
        </Link>

        <header className="mt-5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-mint px-2.5 py-0.5 text-[11px] font-bold text-leaf">{tag}</span>
            ))}
          </div>
          <div className="flex items-start gap-4">
            {post.cover_emoji ? (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-ink text-4xl">{post.cover_emoji}</div>
            ) : null}
            <h1 className="text-3xl font-black leading-[1.1] tracking-[-0.03em] text-ink sm:text-4xl">{post.title}</h1>
          </div>
          <p className="mt-4 font-mono text-[11.5px] uppercase text-lavmute">
            {post.author_name ?? "350x Garage"} · {formatDate(post.published_at)}
          </p>
        </header>

        <div className="article mt-8" dangerouslySetInnerHTML={{ __html: post.body_html }} />

        {related.length > 0 ? (
          <section className="mt-12 border-t border-stone-200 pt-8">
            <p className="eyebrow mb-4">Keep reading</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {related.map((r) => (
                <Link key={r.id} href={`/blog/${r.slug}`} className="rounded-xl border border-stone-200 bg-white p-4 shadow-soft transition hover:border-leaf">
                  <div className="mb-2 text-2xl">{r.cover_emoji ?? "📝"}</div>
                  <p className="text-sm font-bold text-ink">{r.title}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </PublicShell>
  );
}
