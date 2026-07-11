import type { Metadata } from "next";
import { Cable, CheckCircle2, FileText, MessageSquare, MoonStar, Rss, ShieldX, Stethoscope, Youtube } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PublicShell } from "@/components/PublicShell";
import { SOURCE_ADAPTERS } from "@/lib/ingestion/pipeline";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Data Sources — 350x Garage",
  description: "How the 350x Garage knowledge base is sourced: curated research, official APIs, and public feeds — with provenance on every claim."
};

// Env-driven status must reflect the running deployment, not build time.
export const dynamic = "force-dynamic";

const adapterIcons: Record<string, LucideIcon> = {
  youtube: Youtube,
  reddit: MessageSquare,
  rss: Rss
};

const staticSources = [
  {
    title: "Curated seed research",
    status: "Live",
    live: true,
    icon: CheckCircle2,
    note: "Hand-researched issue patterns per model, maintained in-repo and synced to the database. The trust baseline that ingestion augments."
  },
  {
    title: "Rider service logs & bills",
    status: "Live — opt-in",
    live: true,
    icon: FileText,
    note: "First-party data from riders who choose to track their bike. Private by default under row-level security; never shown publicly."
  },
  {
    title: "Rider symptom logs",
    status: "Live — opt-in",
    live: true,
    icon: Stethoscope,
    note: "Structured symptom reports from tracking users. Powers personal risk scores today; anonymized aggregation is a future, consent-first step."
  },
  {
    title: "Facebook / Instagram",
    status: "Deliberately excluded",
    live: false,
    icon: ShieldX,
    note: "No scraping, ever — their terms prohibit it. Owned communities and partnerships are the compliant path if this data is ever needed."
  },
  {
    title: "OBD dongle telemetry",
    status: "Phase 2",
    live: false,
    icon: Cable,
    note: "Hardware integration comes only after the knowledge base and opt-in logging prove value."
  }
];

export default function DataSourcesPage() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8 max-w-3xl">
          <h1 className="text-3xl font-semibold text-ink">Data Sources</h1>
          <p className="mt-2 text-sm leading-6 text-steel">
            Every claim in the knowledge base carries its source type, a link where one exists, and a
            last-verified date. Ingestion uses official APIs and public feeds only — no login-walled or
            terms-violating scraping — and runs as an off-by-default batch job.
          </p>
        </header>

        <h2 className="mb-4 text-lg font-semibold text-ink">Ingestion adapters</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {SOURCE_ADAPTERS.map((adapter) => {
            const Icon = adapterIcons[adapter.id] ?? MessageSquare;
            const configured = adapter.isConfigured();
            return (
              <article key={adapter.id} className="rounded border border-stone-200 bg-white p-5 shadow-soft">
                <div className="flex items-start justify-between gap-3">
                  <Icon className="h-6 w-6 text-leaf" aria-hidden="true" />
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold",
                      configured ? "bg-mint text-leaf" : "bg-stone-100 text-steel"
                    )}
                  >
                    {configured ? <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> : <MoonStar className="h-3 w-3" aria-hidden="true" />}
                    {configured ? "Configured" : "Dormant"}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-ink">{adapter.label}</h3>
                <p className="mt-2 text-sm leading-6 text-steel">{adapter.complianceNote}</p>
                <p className="mt-3 text-xs font-medium text-steel">
                  {configured
                    ? "Runs via the secret-protected /api/ingest batch endpoint."
                    : `Enable by setting ${adapter.requiredEnv.join(" + ")}.`}
                </p>
              </article>
            );
          })}
        </div>

        <h2 className="mb-4 mt-10 text-lg font-semibold text-ink">Other sources</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {staticSources.map((source) => {
            const Icon = source.icon;
            return (
              <article key={source.title} className="rounded border border-stone-200 bg-white p-5 shadow-soft">
                <div className="flex items-start justify-between gap-3">
                  <Icon className="h-6 w-6 text-leaf" aria-hidden="true" />
                  <span
                    className={cn(
                      "rounded px-2 py-1 text-xs font-semibold",
                      source.live ? "bg-mint text-leaf" : "bg-stone-100 text-steel"
                    )}
                  >
                    {source.status}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-ink">{source.title}</h3>
                <p className="mt-2 text-sm leading-6 text-steel">{source.note}</p>
              </article>
            );
          })}
        </div>

        <section className="mt-10 rounded border border-stone-200 bg-white p-5 shadow-soft">
          <h2 className="text-lg font-semibold text-ink">How sourcing stays compliant</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-steel">
            <li>• Official APIs first (YouTube Data API, Reddit OAuth), inside their free quotas and terms.</li>
            <li>• Public RSS/Atom feeds only where syndication terms permit reuse.</li>
            <li>• robots.txt, rate limits, and platform ToS are respected; no login-walled scraping.</li>
            <li>• Every ingested claim stores a public source URL and a last-verified timestamp.</li>
            <li>• Ingestion is a scheduled batch job behind a secret — nothing fetches on user requests.</li>
          </ul>
        </section>
      </div>
    </PublicShell>
  );
}
