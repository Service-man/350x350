import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { IssueClusterCard } from "@/components/IssueClusterCard";
import { COMPONENT_OPTIONS } from "@/lib/constants/components";
import { requireUser, createClient } from "@/lib/supabase/server";
import { isDemoSupabaseConfig } from "@/lib/supabase/config";
import { demoIssueClusters } from "@/lib/demo/data";
import type { IssueCluster } from "@/lib/types";

export default async function ProblemRadarPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireUser();
  const params = await searchParams;
  let data: IssueCluster[] = demoIssueClusters;

  if (!isDemoSupabaseConfig()) {
    const supabase = await createClient();
    const { data: rows = [] } = await supabase.from("issue_clusters").select("*").order("mention_count", { ascending: false });
    data = rows as IssueCluster[];
  }

  const issues = data.filter((issue) => {
    const search = params.q?.toLowerCase();
    if (params.model && issue.bike_model !== params.model) return false;
    if (params.component && issue.component !== params.component) return false;
    if (search) {
      const haystack = `${issue.issue_title} ${issue.issue_summary} ${issue.bike_brand} ${issue.bike_model}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
  const models = Array.from(new Set(data.map((issue) => issue.bike_model))).sort();

  return (
    <AppShell title="Problem Radar" subtitle="Model-wise issue intelligence from seed data today, designed for future compliant community/API ingestion.">
      <form className="panel mb-6 grid gap-3 md:grid-cols-4">
        <label>
          <span className="label">Bike model</span>
          <select className="field mt-1" name="model" defaultValue={params.model ?? ""}>
            <option value="">All models</option>
            {models.map((model) => <option key={model}>{model}</option>)}
          </select>
        </label>
        <label>
          <span className="label">Component</span>
          <select className="field mt-1" name="component" defaultValue={params.component ?? ""}>
            <option value="">All components</option>
            {COMPONENT_OPTIONS.map((component) => <option key={component}>{component}</option>)}
            <option>Engine/Cooling</option>
          </select>
        </label>
        <label className="md:col-span-2">
          <span className="label">Search issue text</span>
          <input className="field mt-1" name="q" defaultValue={params.q ?? ""} placeholder="battery, chain, cost..." />
        </label>
        <button className="btn-secondary md:col-span-4" type="submit">Apply filters</button>
      </form>
      {issues.length === 0 ? (
        <EmptyState title="No radar issues found" description="Try clearing filters or seed more issue clusters." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {issues.map((issue) => <IssueClusterCard key={issue.id} issue={issue} />)}
        </div>
      )}
    </AppShell>
  );
}
