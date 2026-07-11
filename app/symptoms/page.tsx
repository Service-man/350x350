import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { SymptomForm } from "@/components/SymptomForm";
import { COMPONENT_OPTIONS } from "@/lib/constants/components";
import { SEVERITIES } from "@/lib/constants/bikes";
import { requireUser, createClient } from "@/lib/supabase/server";
import { isDemoSupabaseConfig } from "@/lib/supabase/config";
import { demoBikes, demoServiceLogs, demoSymptoms } from "@/lib/demo/data";
import type { Bike, ServiceLog, SymptomLog } from "@/lib/types";
import { formatKm, titleCase } from "@/lib/utils";

export default async function SymptomsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  let typedBikes: Bike[] = demoBikes;
  let serviceLogs: ServiceLog[] = demoServiceLogs;
  let symptoms: SymptomLog[] = demoSymptoms;

  if (!isDemoSupabaseConfig()) {
    const supabase = await createClient();
    const [{ data: bikes = [] }, { data: serviceRows = [] }, { data: symptomRows = [] }] = await Promise.all([
      supabase.from("bikes").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("service_logs").select("*").eq("user_id", user.id).order("service_date", { ascending: false }),
      supabase.from("symptom_logs").select("*").eq("user_id", user.id).order("symptom_date", { ascending: false })
    ]);
    typedBikes = bikes as Bike[];
    serviceLogs = serviceRows as ServiceLog[];
    symptoms = symptomRows as SymptomLog[];
  }

  const typedSymptoms = symptoms.filter((symptom) => {
    if (params.bike && symptom.bike_id !== params.bike) return false;
    if (params.component && symptom.component !== params.component) return false;
    if (params.severity && symptom.severity !== params.severity) return false;
    if (params.resolved === "open" && symptom.resolved) return false;
    if (params.resolved === "resolved" && !symptom.resolved) return false;
    return true;
  });

  return (
    <AppShell title="Symptom Logger" subtitle="Capture rider-observed symptoms with component, severity, frequency, and resolution state.">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SymptomForm bikes={typedBikes} serviceLogs={serviceLogs} />
        <section className="space-y-4">
          <form className="panel grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <label>
              <span className="label">Bike</span>
              <select className="field mt-1" name="bike" defaultValue={params.bike ?? ""}>
                <option value="">All</option>
                {typedBikes.map((bike) => (
                  <option key={bike.id} value={bike.id}>{bike.brand} {bike.model}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="label">Component</span>
              <select className="field mt-1" name="component" defaultValue={params.component ?? ""}>
                <option value="">All</option>
                {COMPONENT_OPTIONS.map((component) => <option key={component}>{component}</option>)}
              </select>
            </label>
            <label>
              <span className="label">Severity</span>
              <select className="field mt-1" name="severity" defaultValue={params.severity ?? ""}>
                <option value="">All</option>
                {SEVERITIES.map((severity) => <option key={severity} value={severity}>{titleCase(severity)}</option>)}
              </select>
            </label>
            <label>
              <span className="label">Status</span>
              <select className="field mt-1" name="resolved" defaultValue={params.resolved ?? ""}>
                <option value="">All</option>
                <option value="open">Open</option>
                <option value="resolved">Resolved</option>
              </select>
            </label>
            <button className="btn-secondary md:col-span-2 xl:col-span-4" type="submit">Apply filters</button>
          </form>
          {typedSymptoms.length === 0 ? (
            <EmptyState title="No symptom logs found" description="Log symptoms as they appear, even if they later turn out to be normal behavior." />
          ) : (
            <div className="space-y-3">
              {typedSymptoms.map((symptom) => {
                const bike = typedBikes.find((item) => item.id === symptom.bike_id);
                return (
                  <article key={symptom.id} className="rounded border border-stone-200 bg-white p-4 shadow-soft">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-leaf">{symptom.component}</p>
                        <h3 className="mt-1 font-semibold text-ink">{symptom.symptom_title}</h3>
                        <p className="mt-1 text-sm text-steel">{bike ? `${bike.brand} ${bike.model}` : "Bike"} · {formatKm(symptom.odometer_km)}</p>
                      </div>
                      <span className="rounded bg-paper px-2 py-1 text-xs font-semibold text-road">
                        {titleCase(symptom.severity)} · {symptom.resolved ? "Resolved" : "Open"}
                      </span>
                    </div>
                    {symptom.symptom_description ? <p className="mt-3 text-sm leading-6 text-steel">{symptom.symptom_description}</p> : null}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
