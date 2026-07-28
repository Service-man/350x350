import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { requireAdmin, adminWritesEnabled } from "@/lib/admin/auth";
import { adminListPosts, adminListGuides } from "@/lib/admin/data";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  await requireAdmin();
  const [posts, guides] = await Promise.all([adminListPosts(), adminListGuides()]);
  const writable = adminWritesEnabled();

  const publishedPosts = posts.filter((post) => post.status === "published").length;
  const publishedGuides = guides.filter((guide) => guide.status === "published").length;
  const productCount = guides.reduce((sum, guide) => sum + guide.products.length, 0);

  const tiles = [
    { label: "Blog posts", value: posts.length, helper: `${publishedPosts} published`, href: "/admin_con/blog", cta: "Manage blog" },
    { label: "DIY guides", value: guides.length, helper: `${publishedGuides} published`, href: "/admin_con/diy", cta: "Manage DIY" },
    { label: "Affiliate links", value: productCount, helper: "across all guides", href: "/admin_con/diy", cta: "Review links" }
  ];

  return (
    <AdminShell title="Admin console" subtitle="Create and edit blog posts, DIY guides, and affiliate product links.">
      {!writable ? (
        <p className="mb-5 rounded-lg border border-stone-300 bg-mint p-3 font-mono text-xs text-lavmute">
          demo mode — content is read-only. Add Supabase env vars + set ADMIN_EMAILS to enable editing.
        </p>
      ) : null}
      <div className="grid gap-3.5 md:grid-cols-3">
        {tiles.map((tile) => (
          <Link key={tile.label} href={tile.href} className="panel p-[18px] transition hover:border-leaf">
            <p className="mb-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-leaf">{tile.label}</p>
            <p className="text-3xl font-black text-ink">{tile.value}</p>
            <p className="mt-0.5 text-xs text-steel">{tile.helper}</p>
            <p className="mt-3 text-[12.5px] font-bold text-leaf">{tile.cta} →</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-3.5 md:grid-cols-2">
        <Link href="/admin_con/blog/new" className="btn-dark">+ New blog post</Link>
        <Link href="/admin_con/diy/new" className="btn-secondary">+ New DIY guide</Link>
      </div>
    </AdminShell>
  );
}
