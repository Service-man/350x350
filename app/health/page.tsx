import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { RiskScoreCard } from "@/components/RiskScoreCard";
import { requireUser, createClient } from "@/lib/supabase/server";
import { calculateRiskScores } from "@/lib/risk/riskScoring";
import type { Bike, ServiceLog, SymptomLog } from "@/lib/types";

export default async function HealthPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const supabase = await createClient();
  const [{ data: bikes = [] }, { data: services = [] }, { data: symptoms = [] }] = await Promise.all([
    supabase.from("bikes").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("service_logs").select("*").eq("user_id", user.id),
    supabase.from("symptom_logs").select("*").eq("user_id", user.id)
  ]);
  const typedBikes = bikes as Bike[];
  const selectedBike = typedBikes.find((bike) => bike.id === params.bike) ?? typedBikes[0];
  const scores = selectedBike
    ? calculateRiskScores(selectedBike, symptoms as SymptomLog[], services as ServiceLog[])
    : [];

  return (
    <AppShell title="Component Risk Score" subtitle="Simple rule-based scoring from first-party logs. This is not OEM-certified diagnostics or engineering-grade prediction.">
      {typedBikes.length === 0 ? (
        <EmptyState title="Add your first bike to calculate risk scores." actionHref="/garage" actionLabel="Add bike" />
      ) : (
        <>
          <form className="panel mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex-1">
              <span className="label">Selected bike</span>
              <select className="field mt-1" name="bike" defaultValue={selectedBike?.id}>
                {typedBikes.map((bike) => (
                  <option key={bike.id} value={bike.id}>{bike.brand} {bike.model}</option>
                ))}
              </select>
            </label>
            <button className="btn-secondary" type="submit">Update</button>
          </form>
          <div className="mb-5 rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Risk scores are early indicators based on rider logs and service history, not OEM-certified diagnostics.
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {scores.map((risk) => <RiskScoreCard key={risk.component} risk={risk} />)}
          </div>
        </>
      )}
    </AppShell>
  );
}
