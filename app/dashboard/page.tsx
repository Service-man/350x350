import { Activity, BikeIcon, IndianRupee, Stethoscope, Wrench } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { RiskScoreCard } from "@/components/RiskScoreCard";
import { StatCard } from "@/components/StatCard";
import { requireUser, createClient } from "@/lib/supabase/server";
import { calculateRiskScores } from "@/lib/risk/riskScoring";
import type { Bike, IssueCluster, ServiceLog, SymptomLog } from "@/lib/types";
import { formatInr } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const [{ data: bikes = [] }, { data: serviceLogs = [] }, { data: symptoms = [] }, { data: issues = [] }] =
    await Promise.all([
      supabase.from("bikes").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("service_logs").select("*").eq("user_id", user.id).order("service_date", { ascending: false }),
      supabase.from("symptom_logs").select("*").eq("user_id", user.id).order("symptom_date", { ascending: false }),
      supabase.from("issue_clusters").select("*").limit(5)
    ]);

  const typedBikes = bikes as Bike[];
  const typedServices = serviceLogs as ServiceLog[];
  const typedSymptoms = symptoms as SymptomLog[];
  const selectedBike = typedBikes[0];
  const openSymptoms = typedSymptoms.filter((symptom) => !symptom.resolved);
  const totalCost = typedServices.reduce((sum, log) => sum + Number(log.total_cost ?? 0), 0);
  const risks = selectedBike ? calculateRiskScores(selectedBike, typedSymptoms, typedServices).slice(0, 3) : [];
  const modelIssues = selectedBike
    ? (issues as IssueCluster[]).filter((issue) => issue.bike_model === selectedBike.model).slice(0, 3)
    : (issues as IssueCluster[]).slice(0, 3);

  return (
    <AppShell title="Dashboard" subtitle="A live snapshot from your garage, service logs, symptoms, and seed model intelligence.">
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
            <StatCard label="Service logs" value={typedServices.length} icon={Wrench} helper={formatInr(totalCost)} />
            <StatCard label="Open symptoms" value={openSymptoms.length} icon={Stethoscope} helper="Unresolved rider logs" />
            <StatCard label="Maintenance trend" value="Soon" icon={IndianRupee} helper="Monthly trend placeholder" />
          </div>
          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <section className="panel">
              <h2 className="text-lg font-semibold text-ink">Top common issues</h2>
              <div className="mt-4 space-y-3">
                {modelIssues.map((issue) => (
                  <div key={issue.id} className="rounded border border-stone-200 p-3">
                    <p className="font-semibold text-ink">{issue.issue_title}</p>
                    <p className="mt-1 text-sm text-steel">{issue.component} · {issue.mention_count} seed mentions</p>
                  </div>
                ))}
                {modelIssues.length === 0 ? <p className="text-sm text-steel">No seed issues for this model yet.</p> : null}
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
