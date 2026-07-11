import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarRange, Factory, GaugeCircle, ListChecks, Search, Wrench } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { KnownIssueCard } from "@/components/KnownIssueCard";
import { PublicShell } from "@/components/PublicShell";
import { getKnownIssues } from "@/lib/knowledge/getKnownIssues";
import { findModelBySlugs } from "@/lib/knowledge/slugs";
import type { KnownIssue } from "@/lib/types";

type PageProps = {
  params: Promise<{ brand: string; model: string }>;
  searchParams: Promise<{ year?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { brand, model } = await params;
  const route = findModelBySlugs(brand, model);
  if (!route) return { title: "Model not found — 350x Garage" };
  return {
    title: `${route.brand} ${route.model} known issues & service checkpoints — 350x Garage`,
    description: `What goes wrong with the ${route.brand} ${route.model} in India: issues by mileage checkpoint, manufacturing batch, and RPM band, with preventive actions and cost bands.`
  };
}

function severityRank(issue: KnownIssue) {
  return { critical: 0, high: 1, medium: 2, low: 3 }[issue.severity] ?? 4;
}

function sortIssues(issues: KnownIssue[]) {
  return [...issues].sort((a, b) => severityRank(a) - severityRank(b) || b.mention_count - a.mention_count);
}

export default async function ModelIntelligencePage({ params, searchParams }: PageProps) {
  const [{ brand, model }, { year: yearParam }] = await Promise.all([params, searchParams]);
  const route = findModelBySlugs(brand, model);
  if (!route) notFound();

  const year = Number(yearParam) || null;
  const issues = await getKnownIssues({ brand: route.brand, model: route.model });

  // Disjoint sections: checkpoint timeline first, then batch-specific, then
  // RPM-band notes, then anything without a structured dimension.
  const timeline = issues.filter((issue) => issue.service_checkpoint_km !== null);
  const batch = issues.filter((issue) => issue.service_checkpoint_km === null && issue.mfg_year_start !== null);
  const rpm = issues.filter(
    (issue) => issue.service_checkpoint_km === null && issue.mfg_year_start === null && issue.rpm_band !== null
  );
  const other = issues.filter(
    (issue) => issue.service_checkpoint_km === null && issue.mfg_year_start === null && issue.rpm_band === null
  );

  const checkpoints = Array.from(new Set(timeline.map((issue) => issue.service_checkpoint_km!))).sort(
    (a, b) => a - b
  );
  const batchApplies = year
    ? batch.filter(
        (issue) => issue.mfg_year_start! <= year && year <= (issue.mfg_year_end ?? issue.mfg_year_start!)
      )
    : [];
  const batchRest = year ? batch.filter((issue) => !batchApplies.includes(issue)) : batch;
  const km = (value: number) => new Intl.NumberFormat("en-IN").format(value);

  return (
    <PublicShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-leaf">{route.brand}</p>
            <h1 className="mt-1 text-3xl font-semibold text-ink">{route.model}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-steel">
              {issues.length} known issue{issues.length === 1 ? "" : "s"} from curated research and public
              ownership reports{year ? ` — highlighting what applies to a ${year} build` : ""}. Early
              indicators, not OEM-certified diagnostics.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <form className="flex items-end gap-2">
              <label>
                <span className="label">Your year</span>
                <select className="field mt-1" name="year" defaultValue={yearParam ?? ""}>
                  <option value="">Any</option>
                  {Array.from({ length: 12 }, (_, index) => 2026 - index).map((entry) => (
                    <option key={entry} value={entry}>
                      {entry}
                    </option>
                  ))}
                </select>
              </label>
              <button className="btn-secondary" type="submit">
                Apply
              </button>
            </form>
            <Link className="btn-secondary" href={`/library?model=${encodeURIComponent(route.model)}`}>
              <Search className="h-4 w-4" aria-hidden="true" />
              Search these issues
            </Link>
            <Link className="btn-primary" href="/signup">
              <Wrench className="h-4 w-4" aria-hidden="true" />
              Track this bike
            </Link>
          </div>
        </header>

        {issues.length === 0 ? (
          <EmptyState
            title="No known issues catalogued for this model yet"
            description="The knowledge base grows as curated research and compliant community ingestion expand."
            actionHref="/models"
            actionLabel="Browse other models"
          />
        ) : (
          <div className="space-y-12">
            {checkpoints.length > 0 ? (
              <section>
                <div className="mb-5 flex items-center gap-2">
                  <CalendarRange className="h-5 w-5 text-leaf" aria-hidden="true" />
                  <h2 className="text-xl font-semibold text-ink">What to expect, checkpoint by checkpoint</h2>
                </div>
                <ol className="relative space-y-8 border-l-2 border-mint pl-6">
                  {checkpoints.map((checkpoint) => (
                    <li key={checkpoint}>
                      <span className="absolute -left-[9px] mt-1 h-4 w-4 rounded-full border-2 border-leaf bg-white" />
                      <h3 className="text-lg font-semibold text-ink">Around {km(checkpoint)} km</h3>
                      <div className="mt-3 grid gap-4 lg:grid-cols-2">
                        {sortIssues(timeline.filter((issue) => issue.service_checkpoint_km === checkpoint)).map(
                          (issue) => (
                            <KnownIssueCard key={issue.id} issue={issue} />
                          )
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}

            {batch.length > 0 ? (
              <section>
                <div className="mb-5 flex items-center gap-2">
                  <Factory className="h-5 w-5 text-leaf" aria-hidden="true" />
                  <h2 className="text-xl font-semibold text-ink">Batch-specific issues</h2>
                </div>
                {year && batchApplies.length > 0 ? (
                  <div className="mb-4 rounded border border-amberline bg-amber-50 p-3 text-sm font-medium text-amber-800">
                    {batchApplies.length} issue{batchApplies.length === 1 ? "" : "s"} below match your {year}{" "}
                    build year.
                  </div>
                ) : null}
                {year && batchApplies.length === 0 ? (
                  <div className="mb-4 rounded border border-leaf bg-mint p-3 text-sm font-medium text-leaf">
                    No batch-specific issues on record for a {year} build. The reports below affect other years.
                  </div>
                ) : null}
                <div className="grid gap-4 lg:grid-cols-2">
                  {sortIssues(batchApplies).map((issue) => (
                    <KnownIssueCard key={issue.id} issue={issue} />
                  ))}
                  {sortIssues(batchRest).map((issue) => (
                    <div key={issue.id} className={year ? "opacity-60" : undefined}>
                      <KnownIssueCard issue={issue} />
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {rpm.length > 0 ? (
              <section>
                <div className="mb-5 flex items-center gap-2">
                  <GaugeCircle className="h-5 w-5 text-leaf" aria-hidden="true" />
                  <h2 className="text-xl font-semibold text-ink">RPM-band behaviour</h2>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  {sortIssues(rpm).map((issue) => (
                    <KnownIssueCard key={issue.id} issue={issue} />
                  ))}
                </div>
              </section>
            ) : null}

            {other.length > 0 ? (
              <section>
                <div className="mb-5 flex items-center gap-2">
                  <ListChecks className="h-5 w-5 text-leaf" aria-hidden="true" />
                  <h2 className="text-xl font-semibold text-ink">Other ownership notes</h2>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  {sortIssues(other).map((issue) => (
                    <KnownIssueCard key={issue.id} issue={issue} />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        )}
      </div>
    </PublicShell>
  );
}
