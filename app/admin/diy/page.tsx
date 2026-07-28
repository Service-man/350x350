import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { requireAdmin } from "@/lib/admin/auth";
import { adminListGuides } from "@/lib/admin/data";

export const dynamic = "force-dynamic";

export default async function AdminDiyList() {
  await requireAdmin();
  const guides = await adminListGuides();

  return (
    <AdminShell
      title="DIY guides"
      subtitle="Curated fixes with Amazon affiliate product links, shown at /diy."
      action={<Link className="btn-dark" href="/admin/diy/new">+ New guide</Link>}
    >
      {guides.length === 0 ? (
        <p className="panel text-sm text-steel">No guides yet. Create your first one.</p>
      ) : (
        <div className="panel divide-y divide-stone-200 p-0">
          {guides.map((guide) => (
            <Link key={guide.id} href={`/admin/diy/${guide.id}`} className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-paper">
              <div className="min-w-0">
                <p className="truncate font-bold text-ink">{guide.title}</p>
                <p className="mt-0.5 font-mono text-[11.5px] uppercase text-lavmute">
                  {guide.products.length} product{guide.products.length === 1 ? "" : "s"} · {guide.difficulty}
                </p>
              </div>
              <span
                className={
                  guide.status === "published"
                    ? "shrink-0 rounded-full border border-leaf/40 bg-mint px-2.5 py-0.5 text-[11px] font-extrabold uppercase text-leaf"
                    : "shrink-0 rounded-full border border-stone-300 px-2.5 py-0.5 text-[11px] font-extrabold uppercase text-steel"
                }
              >
                {guide.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
