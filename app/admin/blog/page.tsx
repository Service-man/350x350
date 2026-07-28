import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { requireAdmin } from "@/lib/admin/auth";
import { adminListPosts } from "@/lib/admin/data";

export const dynamic = "force-dynamic";

export default async function AdminBlogList() {
  await requireAdmin();
  const posts = await adminListPosts();

  return (
    <AdminShell
      title="Blog posts"
      subtitle="Create and edit editorial content shown at /blog."
      action={<Link className="btn-dark" href="/admin/blog/new">+ New post</Link>}
    >
      {posts.length === 0 ? (
        <p className="panel text-sm text-steel">No posts yet. Create your first one.</p>
      ) : (
        <div className="panel divide-y divide-stone-200 p-0">
          {posts.map((post) => (
            <Link key={post.id} href={`/admin/blog/${post.id}`} className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-paper">
              <div className="min-w-0">
                <p className="truncate font-bold text-ink">
                  {post.cover_emoji ? <span className="mr-2">{post.cover_emoji}</span> : null}
                  {post.title}
                </p>
                <p className="mt-0.5 font-mono text-[11.5px] uppercase text-lavmute">/{post.slug}</p>
              </div>
              <span
                className={
                  post.status === "published"
                    ? "shrink-0 rounded-full border border-leaf/40 bg-mint px-2.5 py-0.5 text-[11px] font-extrabold uppercase text-leaf"
                    : "shrink-0 rounded-full border border-stone-300 px-2.5 py-0.5 text-[11px] font-extrabold uppercase text-steel"
                }
              >
                {post.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
