import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { PublicShell } from "@/components/PublicShell";
import { getKnownIssues } from "@/lib/knowledge/getKnownIssues";
import { MODEL_ROUTES } from "@/lib/knowledge/slugs";

export const metadata: Metadata = {
  title: "Model Library — 350x Garage",
  description: "Known issues, service checkpoints, and repair-cost bands for 350cc+ motorcycles in India."
};

// Public knowledge index; refresh hourly so ingestion updates surface without
// a redeploy.
export const revalidate = 3600;

export default async function ModelsPage() {
  const issues = await getKnownIssues();

  const cards = MODEL_ROUTES.map((route) => {
    const modelIssues = issues.filter((issue) => issue.brand === route.brand && issue.model === route.model);
    const highSeverity = modelIssues.filter((issue) => ["high", "critical"].includes(issue.severity)).length;
    const components = Array.from(new Set(modelIssues.map((issue) => issue.component))).slice(0, 3);
    return { route, count: modelIssues.length, highSeverity, components };
  });

  return (
    <PublicShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8 max-w-3xl">
          <h1 className="text-3xl font-semibold text-ink">Model Library</h1>
          <p className="mt-2 text-sm leading-6 text-steel">
            Pick your motorcycle to see its known issues organized by service checkpoint, manufacturing batch,
            and RPM band. All of it is browsable without an account.
          </p>
        </header>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map(({ route, count, highSeverity, components }) => (
            <Link
              key={`${route.brandSlug}-${route.modelSlug}`}
              href={`/models/${route.brandSlug}/${route.modelSlug}`}
              className="group rounded border border-stone-200 bg-white p-5 shadow-soft transition hover:border-leaf"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-leaf">{route.brand}</p>
                  <h2 className="mt-1 text-xl font-semibold text-ink">{route.model}</h2>
                </div>
                <ChevronRight className="h-5 w-5 text-steel transition group-hover:text-leaf" aria-hidden="true" />
              </div>
              <p className="mt-4 text-sm text-steel">
                {count} known issue{count === 1 ? "" : "s"} tracked
                {highSeverity > 0 ? (
                  <span className="ml-2 inline-flex items-center gap-1 text-danger">
                    <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                    {highSeverity} high severity
                  </span>
                ) : null}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {components.map((component) => (
                  <span key={component} className="rounded bg-paper px-2 py-1 text-xs font-semibold text-road">
                    {component}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </PublicShell>
  );
}
