import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { PublicShell } from "@/components/PublicShell";
import { getKnownIssues } from "@/lib/knowledge/getKnownIssues";
import { MODEL_ROUTES } from "@/lib/knowledge/slugs";
import { CATALOG_BRANDS } from "@/lib/catalog/bikeCatalog";

export const metadata: Metadata = {
  title: "Model Library — 350x Garage",
  description: "Known issues, service checkpoints, and repair-cost bands for 300cc+ motorcycles in India across every major brand."
};

export const revalidate = 3600;

export default async function ModelsPage() {
  const issues = await getKnownIssues();
  const issueCountByModel = new Map<string, number>();
  for (const issue of issues) {
    const key = `${issue.brand}::${issue.model}`;
    issueCountByModel.set(key, (issueCountByModel.get(key) ?? 0) + 1);
  }

  const brands = CATALOG_BRANDS.map((brand) => ({
    brand,
    routes: MODEL_ROUTES.filter((route) => route.brand === brand)
  }));

  return (
    <PublicShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8 max-w-3xl">
          <p className="eyebrow mb-3">Pick your machine</p>
          <h1 className="text-4xl font-black tracking-[-0.03em] text-ink">Model Library</h1>
          <p className="mt-2 text-sm leading-6 text-steel">
            {MODEL_ROUTES.length} models across {CATALOG_BRANDS.length}{" "}
            brands in India&apos;s 300cc+ segment. Pick your motorcycle to see its known issues by service
            checkpoint, manufacturing batch, and RPM band — no account needed.
          </p>
        </header>

        <div className="space-y-10">
          {brands.map(({ brand, routes }) => (
            <section key={brand}>
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="text-lg font-semibold text-ink">{brand}</h2>
                <span className="text-xs text-steel">{routes.length} models</span>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {routes.map((route) => {
                  const count = issueCountByModel.get(`${route.brand}::${route.model}`) ?? 0;
                  const { entry } = route;
                  return (
                    <Link
                      key={`${route.brandSlug}-${route.modelSlug}`}
                      href={`/models/${route.brandSlug}/${route.modelSlug}`}
                      className="group flex items-center justify-between gap-3 rounded border border-stone-200 bg-white p-4 shadow-soft transition hover:border-leaf"
                    >
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-ink">{route.model}</h3>
                        <p className="mt-1 text-xs text-steel">
                          {entry.engine_cc}cc · {entry.body_type}
                          {entry.year_end ? ` · '${String(entry.year_start).slice(2)}–'${String(entry.year_end).slice(2)}` : ""}
                        </p>
                        <p className="mt-1 text-xs font-medium text-leaf">
                          {count > 0 ? `${count} known issue${count === 1 ? "" : "s"}` : "No issues logged yet"}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 shrink-0 text-steel transition group-hover:text-leaf" aria-hidden="true" />
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </PublicShell>
  );
}
