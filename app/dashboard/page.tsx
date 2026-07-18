import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { RiskScoreCard } from "@/components/RiskScoreCard";
import { StatCard } from "@/components/StatCard";
import { requireUser, createClient } from "@/lib/supabase/server";
import { isDemoSupabaseConfig } from "@/lib/supabase/config";
import { calculateRiskScores } from "@/lib/risk/riskScoring";
import { getKnownIssues } from "@/lib/knowledge/getKnownIssues";
import { modelPath } from "@/lib/knowledge/slugs";
import { demoBikes, demoServiceLogs, demoSymptoms } from "@/lib/demo/data";
import type { Bike, KnownIssue, ServiceLog, SymptomLog } from "@/lib/types";
import { formatInr } from "@/lib/utils";

// Average spend per month across the trailing six calendar months.
function monthlyMaintenanceAverage(serviceLogs: ServiceLog[]) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const total = serviceLogs
    .filter((log) => {
      const date = new Date(log.service_date);
      return date >= start && date <= now;
    })
    .reduce((sum, log) => sum + Number(log.total_cost ?? 0), 0);
  return { average: Math.round(total / 6), total };
}

// "COMPONENT · BAND · N MENTIONS" — the mono meta line under each issue row.
function issueMeta(issue: KnownIssue) {
  const band = issue.mileage_band ?? issue.rpm_band ?? "General";
  return `${issue.component} · ${band} · ${issue.mention_count} mentions`;
}

export default async function DashboardPage() {
  const user = await requireUser();
  let typedBikes: Bike[] = demoBikes;
  let typedServices: ServiceLog[] = demoServiceLogs;
  let typedSymptoms: SymptomLog[] = demoSymptoms;

  if (!isDemoSupabaseConfig()) {
    const supabase = await createClient();
    const [{ data: bikes = [] }, { data: serviceLogs = [] }, { data: symptoms = [] }] = await Promise.all([
      supabase.from("bikes").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("service_logs").select("*").eq("user_id", user.id).order("service_date", { ascending: false }),
      supabase.from("symptom_logs").select("*").eq("user_id", user.id).order("symptom_date", { ascending: false })
    ]);
    typedBikes = bikes as Bike[];
    typedServices = serviceLogs as ServiceLog[];
    typedSymptoms = symptoms as SymptomLog[];
  }

  const selectedBike = typedBikes[0];
  const openSymptoms = typedSymptoms.filter((symptom) => !symptom.resolved);
  const totalCost = typedServices.reduce((sum, log) => sum + Number(log.total_cost ?? 0), 0);
  const trend = monthlyMaintenanceAverage(typedServices);
  const risks = selectedBike ? calculateRiskScores(selectedBike, typedSymptoms, typedServices).slice(0, 3) : [];
  const modelIssues = selectedBike
    ? (await getKnownIssues({ brand: selectedBike.brand, model: selectedBike.model })).slice(0, 3)
    : (await getKnownIssues()).slice(0, 3);

  const bay = selectedBike
    ? {
        title: `${selectedBike.model}`,
        meta: [
          `${new Intl.NumberFormat("en-IN").format(selectedBike.odometer_km)} km`,
          selectedBike.manufacturing_year ? `${selectedBike.manufacturing_year} batch` : null
        ]
          .filter(Boolean)
          .join(" · ")
      }
    : undefined;

  return (
    <AppShell
      title="The bay"
      subtitle="Live snapshot — garage, logs, symptoms, model intel."
      action={
        <Link className="btn-dark" href="/service-logs">
          + Log a service
        </Link>
      }
      bay={bay}
    >
      {typedBikes.length === 0 ? (
        <EmptyState
          title="Add your first bike to start tracking health and service history."
          description="Once a bike is added, your service costs, open symptoms, and component risk summary will show up here."
          actionHref="/garage"
          actionLabel="Add bike"
        />
      ) : (
        <div className="space-y-5">
          <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Bikes"
              value={typedBikes.length}
              helper={selectedBike ? `${selectedBike.brand} ${selectedBike.model} selected` : undefined}
            />
            <StatCard label="Service logs" value={typedServices.length} helper={`${formatInr(totalCost)} lifetime`} />
            <StatCard label="Open symptoms" value={openSymptoms.length} helper="Unresolved rider logs" />
            <StatCard
              label="Spend trend"
              value={formatInr(trend.average)}
              helper="per month · 6-mo avg"
              variant="dark"
            />
          </div>
          <div className="grid gap-3.5 xl:grid-cols-[1.15fr_0.85fr]">
            <section className="panel p-[22px]">
              <div className="mb-4 flex items-baseline justify-between gap-3">
                <h2 className="font-extrabold text-ink">Known issues — your model</h2>
                {selectedBike ? (
                  <Link
                    className="text-[12.5px] font-bold text-leaf hover:text-[#4C1D95]"
                    href={modelPath(selectedBike.brand, selectedBike.model)}
                  >
                    Full issue map →
                  </Link>
                ) : null}
              </div>
              <div className="space-y-2.5">
                {modelIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="rounded-lg border border-stone-200 border-l-[3px] border-l-leaf px-4 py-3.5"
                  >
                    <p className="text-sm font-bold text-ink">{issue.issue_title}</p>
                    <p className="mt-1 font-mono text-[11.5px] uppercase text-lavmute">{issueMeta(issue)}</p>
                  </div>
                ))}
                {modelIssues.length === 0 ? (
                  <p className="text-sm text-steel">No known issues catalogued for this model yet.</p>
                ) : null}
              </div>
            </section>
            <section className="panel p-[22px]">
              <h2 className="mb-4 font-extrabold text-ink">Component risk</h2>
              <div className="flex flex-col gap-3">
                {risks.map((risk) => (
                  <RiskScoreCard key={risk.component} risk={risk} />
                ))}
                {risks.length === 0 ? (
                  <p className="text-sm text-steel">Risk scores appear once a bike is being tracked.</p>
                ) : null}
              </div>
            </section>
          </div>
        </div>
      )}
    </AppShell>
  );
}
