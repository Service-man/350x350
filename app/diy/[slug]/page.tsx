import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { PublicShell } from "@/components/PublicShell";
import { AffiliateDisclosure } from "@/components/AffiliateDisclosure";
import { getGuideBySlug } from "@/lib/diy/getDiy";
import { modelPath } from "@/lib/knowledge/slugs";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) return { title: "DIY & Fixes — BikeKundli" };
  return { title: `${guide.title} — BikeKundli`, description: guide.summary ?? undefined };
}

const difficultyStyle: Record<string, string> = {
  easy: "border-leaf/40 bg-mint text-leaf",
  medium: "border-amberline/50 bg-amber-50 text-amber-700",
  advanced: "border-danger/40 bg-red-50 text-danger"
};

export default async function DiyGuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) notFound();

  return (
    <PublicShell>
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/diy" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-steel transition hover:text-leaf">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All DIY guides
        </Link>

        <header className="mt-5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-extrabold uppercase ${difficultyStyle[guide.difficulty] ?? difficultyStyle.easy}`}>
              {guide.difficulty}
            </span>
            {guide.estimated_time ? <span className="font-mono text-[11px] uppercase text-lavmute">{guide.estimated_time}</span> : null}
            {guide.component ? <span className="rounded bg-paper px-2 py-1 font-mono text-[10.5px] uppercase text-road">{guide.component}</span> : null}
          </div>
          <h1 className="text-3xl font-black leading-[1.1] tracking-[-0.03em] text-ink sm:text-4xl">{guide.title}</h1>
          {guide.summary ? <p className="mt-3 text-[15px] leading-7 text-steel">{guide.summary}</p> : null}
          {guide.brand && guide.model ? (
            <Link href={modelPath(guide.brand, guide.model)} className="mt-3 inline-block text-[13px] font-bold text-leaf hover:text-[#4C1D95]">
              See {guide.brand} {guide.model} known issues →
            </Link>
          ) : null}
        </header>

        {/* Steps */}
        {guide.steps.length > 0 ? (
          <section className="mt-8">
            <p className="eyebrow mb-4">The steps</p>
            <ol className="space-y-3">
              {guide.steps.map((step, i) => (
                <li key={i} className="flex gap-4 rounded-xl border border-stone-200 bg-white p-4 shadow-soft">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-black text-white">{i + 1}</span>
                  <div>
                    {step.title ? <p className="font-bold text-ink">{step.title}</p> : null}
                    {step.detail ? <p className="mt-0.5 text-sm leading-6 text-steel">{step.detail}</p> : null}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {/* Products */}
        {guide.products.length > 0 ? (
          <section className="mt-10">
            <p className="eyebrow mb-2">What you&apos;ll need</p>
            <AffiliateDisclosure className="mb-4" />
            <div className="space-y-3">
              {guide.products.map((product) => (
                <div key={product.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-soft">
                  <div className="min-w-0">
                    <p className="font-bold text-ink">{product.title}</p>
                    {product.description ? <p className="mt-0.5 text-[13px] text-steel">{product.description}</p> : null}
                    {product.approx_price ? <p className="mt-1 font-mono text-[11.5px] uppercase text-lavmute">approx {product.approx_price}</p> : null}
                  </div>
                  <a
                    href={product.amazon_url}
                    target="_blank"
                    rel="sponsored nofollow noopener noreferrer"
                    className="btn-primary shrink-0"
                  >
                    View on Amazon
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <p className="mt-10 rounded-lg border border-stone-200 bg-paper p-4 text-[12.5px] leading-5 text-steel">
          <span className="font-bold text-ink">Safety note:</span> DIY steps are general guidance, not a
          substitute for your model&apos;s service manual. If a job is beyond your comfort or tools, a qualified
          mechanic is the right call.
        </p>
      </article>
    </PublicShell>
  );
}
