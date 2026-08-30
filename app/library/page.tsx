import type { Metadata } from "next";
import { EmptyState } from "@/components/EmptyState";
import { KnownIssueCard } from "@/components/KnownIssueCard";
import { PublicShell } from "@/components/PublicShell";
import { COMPONENT_OPTIONS } from "@/lib/constants/components";
import { SEVERITIES } from "@/lib/constants/bikes";
import { BIKE_CATALOG, CATALOG_BRANDS } from "@/lib/catalog/bikeCatalog";
import { getKnownIssues } from "@/lib/knowledge/getKnownIssues";
import { titleCase } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Bike Library — BikeKundli",
  description: "Search known issues for 300cc+ motorcycles in India by model, component, severity, and mileage band."
};

export default async function LibraryPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const allIssues = await getKnownIssues();
  const issues = await getKnownIssues({
    brand: params.brand,
    model: params.model,
    component: params.component,
    severity: params.severity,
    mileageBand: params.band,
    q: params.q
  });

  // Filter options come from the full catalogue so every model is selectable,
  // even ones whose issue set is still empty. When a brand is chosen, scope the
  // model list to that brand.
  const brands = CATALOG_BRANDS.slice().sort();
  const models = Array.from(
    new Set(
      BIKE_CATALOG.filter((b) => !params.brand || b.brand === params.brand).map((b) => b.model)
    )
  ).sort();
  const bands = Array.from(new Set(allIssues.map((issue) => issue.mileage_band).filter(Boolean))).sort() as string[];

  return (
    <PublicShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-6 max-w-3xl">
          <p className="eyebrow mb-3">Knowledge base</p>
          <h1 className="text-4xl font-black tracking-[-0.03em] text-ink">Bike Library</h1>
          <p className="mt-2 text-sm leading-6 text-steel">
            Search the full knowledge base of known issues — curated research today, compliant community
            ingestion as sources come online. No account needed.
          </p>
        </header>
        <form className="panel mb-6 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          <label>
            <span className="label">Brand</span>
            <select className="field mt-1" name="brand" defaultValue={params.brand ?? ""}>
              <option value="">All brands</option>
              {brands.map((brand) => (
                <option key={brand}>{brand}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="label">Model</span>
            <select className="field mt-1" name="model" defaultValue={params.model ?? ""}>
              <option value="">All models</option>
              {models.map((model) => (
                <option key={model}>{model}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="label">Component</span>
            <select className="field mt-1" name="component" defaultValue={params.component ?? ""}>
              <option value="">All components</option>
              {COMPONENT_OPTIONS.map((component) => (
                <option key={component}>{component}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="label">Severity</span>
            <select className="field mt-1" name="severity" defaultValue={params.severity ?? ""}>
              <option value="">All severities</option>
              {SEVERITIES.map((severity) => (
                <option key={severity} value={severity}>
                  {titleCase(severity)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="label">Mileage band</span>
            <select className="field mt-1" name="band" defaultValue={params.band ?? ""}>
              <option value="">All bands</option>
              {bands.map((band) => (
                <option key={band}>{band}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="label">Search text</span>
            <input className="field mt-1" name="q" defaultValue={params.q ?? ""} placeholder="battery, buzz, fan..." />
          </label>
          <button className="btn-secondary md:col-span-3 xl:col-span-6" type="submit">
            Apply filters
          </button>
        </form>
        <p className="mb-4 text-sm text-steel">
          {issues.length} issue{issues.length === 1 ? "" : "s"} found
        </p>
        {issues.length === 0 ? (
          <EmptyState
            title="No known issues match these filters"
            description="Try clearing a filter or searching a broader term."
            actionHref="/library"
            actionLabel="Clear filters"
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {issues.map((issue) => (
              <KnownIssueCard key={issue.id} issue={issue} showModel />
            ))}
          </div>
        )}
      </div>
    </PublicShell>
  );
}
