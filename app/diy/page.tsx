import type { Metadata } from "next";
import Link from "next/link";
import { Wrench } from "lucide-react";
import { PublicShell } from "@/components/PublicShell";
import { AffiliateDisclosure } from "@/components/AffiliateDisclosure";
import { getPublishedGuides } from "@/lib/diy/getDiy";

export const metadata: Metadata = {
  title: "DIY & Fixes — BikeKundli",
  description: "Simple, curated do-it-yourself fixes for common 300cc+ motorcycle issues, with the exact parts and tools you need."
};

export const dynamic = "force-dynamic";

const difficultyStyle: Record<string, string> = {
  easy: "border-leaf/40 bg-mint text-leaf",
  medium: "border-amberline/50 bg-amber-50 text-amber-700",
  advanced: "border-danger/40 bg-red-50 text-danger"
};

export default async function DiyIndex() {
  const guides = await getPublishedGuides();

  return (
    <PublicShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-6 max-w-3xl">
          <p className="eyebrow mb-3">Do it yourself</p>
          <h1 className="text-4xl font-black tracking-[-0.03em] text-ink">DIY &amp; Fixes</h1>
          <p className="mt-2 text-sm leading-6 text-steel">
            Simple, curated fixes for the issues 300cc+ riders hit most — with the exact parts and tools for
            each job. Save a workshop trip when you can do it yourself.
          </p>
        </header>

        <AffiliateDisclosure className="mb-8 max-w-3xl" />

        {guides.length === 0 ? (
          <p className="panel text-sm text-steel">No guides yet — check back soon.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {guides.map((guide) => (
              <Link
                key={guide.id}
                href={`/diy/${guide.slug}`}
                className="group flex flex-col rounded-xl border border-stone-200 bg-white p-5 shadow-soft transition hover:border-leaf"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <Wrench className="h-5 w-5 text-leaf" aria-hidden="true" />
                  <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-extrabold uppercase ${difficultyStyle[guide.difficulty] ?? difficultyStyle.easy}`}>
                    {guide.difficulty}
                  </span>
                </div>
                <h3 className="font-extrabold text-ink group-hover:text-leaf">{guide.title}</h3>
                {guide.summary ? <p className="mt-1.5 line-clamp-3 text-[13px] leading-6 text-steel">{guide.summary}</p> : null}
                <div className="mt-auto flex flex-wrap items-center gap-2 pt-3 font-mono text-[11px] uppercase text-lavmute">
                  {guide.estimated_time ? <span>{guide.estimated_time}</span> : null}
                  {guide.component ? <span>· {guide.component}</span> : null}
                  <span>· {guide.products.length} part{guide.products.length === 1 ? "" : "s"}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PublicShell>
  );
}
