import Link from "next/link";
import { Activity, BikeIcon, IndianRupee, Stethoscope, Wrench } from "lucide-react";
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
import type { Bike, ServiceLog, SymptomLog } from "@/lib/types";
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

  return (
    <AppShell title="Dashboard" subtitle="A live snapshot from your garage, service logs, symptoms, and the model knowledge base.">
      {typedBikes.length === 0 ? (
        <EmptyState
          title="Add your first bike to start tracking health and service history."
          description="Once a bike is added, your service costs, open symptoms, and component risk summary will show up here."
          actionHref="/garage"
          actionLabel="Add bike"
        />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Bikes" value={typedBikes.length} icon={BikeIcon} helper={selectedBike ? `${selectedBike.brand} ${selectedBike.model} selected` : undefined} />
            <StatCard label="Service logs" value={typedServices.length} icon={Wrench} helper={`${formatInr(totalCost)} lifetime`} />
            <StatCard label="Open symptoms" value={openSymptoms.length} icon={Stethoscope} helper="Unresolved rider logs" />
            <StatCard
              label="Maintenance trend"
              value={formatInr(trend.average)}
              icon={IndianRupee}
              helper={`per month · ${formatInr(trend.total)} over 6 months`}
            />
          </div>
          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <section className="panel">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-ink">Known issues for your model</h2>
                {selectedBike ? (
                  <Link className="text-sm font-semibold text-leaf" href={modelPath(selectedBike.brand, selectedBike.model)}>
                    Full issue map →
                  </Link>
                ) : null}
              </div>
              <div className="mt-4 space-y-3">
                {modelIssues.map((issue) => (
                  <div key={issue.id} className="rounded border border-stone-200 p-3">
                    <p className="font-semibold text-ink">{issue.issue_title}</p>
                    <p className="mt-1 text-sm text-steel">
                      {issue.component} · {issue.mileage_band ?? issue.rpm_band ?? "General"} · {issue.mention_count} mentions
                    </p>
                  </div>
                ))}
                {modelIssues.length === 0 ? (
                  <p className="text-sm text-steel">No known issues catalogued for this model yet.</p>
                ) : null}
              </div>
            </section>
            <section>
              <div className="mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-leaf" aria-hidden="true" />
                <h2 className="text-lg font-semibold text-ink">Component risk summary</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
                {risks.map((risk) => (
                  <RiskScoreCard key={risk.component} risk={risk} />
                ))}
              </div>
            </section>
          </div>
        </div>
      )}
    </AppShell>
  );
}
