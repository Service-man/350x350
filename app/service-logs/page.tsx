import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { ServiceLogEntry } from "@/components/ServiceLogEntry";
import { requireUser, createClient } from "@/lib/supabase/server";
import { isDemoSupabaseConfig } from "@/lib/supabase/config";
import { demoBikes, demoServiceLogs } from "@/lib/demo/data";
import type { Bike, ServiceLog, ServiceLogDraft } from "@/lib/types";
import { formatInr, formatKm, titleCase } from "@/lib/utils";

// ?draft= carries a base64url JSON draft from the kundli chat; ?new=1 opens
// the manual form pre-filled from the rider's first bike.
function decodeDraft(raw: string | undefined): ServiceLogDraft | null {
  if (!raw) return null;
  try {
    const json = decodeURIComponent(escape(Buffer.from(decodeURIComponent(raw), "base64").toString("binary")));
    const parsed = JSON.parse(json) as ServiceLogDraft;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export default async function ServiceLogsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  let typedBikes: Bike[] = demoBikes;
  let logs: ServiceLog[] = demoServiceLogs;
  const supabase = isDemoSupabaseConfig() ? null : await createClient();

  if (supabase) {
    const [{ data: bikes = [] }, { data: serviceLogs = [] }] = await Promise.all([
      supabase.from("bikes").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("service_logs").select("*").eq("user_id", user.id).order("service_date", { ascending: false })
    ]);
    typedBikes = (bikes as Bike[]).map((bike) => ({ ...bike, riding_profile: bike.riding_profile ?? {} }));
    logs = serviceLogs as ServiceLog[];
  }

  const chatDraft = decodeDraft(params.draft);
  const firstBike = typedBikes[0];
  const initialDraft: ServiceLogDraft | null = chatDraft
    ? { ...chatDraft, bike_id: chatDraft.bike_id && typedBikes.some((b) => b.id === chatDraft.bike_id) ? chatDraft.bike_id : firstBike?.id ?? null }
    : params.new && firstBike
      ? { bike_id: firstBike.id, odometer_km: firstBike.odometer_km, city: firstBike.city }
      : null;
  const initialOpen = Boolean(chatDraft || params.new);

  const filteredLogs = logs.filter((log) => !params.bike || log.bike_id === params.bike);
  const signedBillUrls = new Map<string, string>();

  await Promise.all(
    filteredLogs.map(async (log) => {
      if (!log.bill_file_url || !supabase) return;
      const { data: signed } = await supabase.storage.from("service-bills").createSignedUrl(log.bill_file_url, 60 * 10);
      if (signed?.signedUrl) signedBillUrls.set(log.id, signed.signedUrl);
    })
  );

  return (
    <AppShell title="Service Logs" subtitle="Upload a bill and we read it — or enter a visit by hand. Every log sharpens your kundli.">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <ServiceLogEntry userId={user.id} bikes={typedBikes} initialDraft={initialDraft} initialOpen={initialOpen} />
        <section className="space-y-4">
          <form className="panel flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex-1">
              <span className="label">Filter by bike</span>
              <select className="field mt-1" name="bike" defaultValue={params.bike ?? ""}>
                <option value="">All bikes</option>
                {typedBikes.map((bike) => (
                  <option key={bike.id} value={bike.id}>{bike.brand} {bike.model}</option>
                ))}
              </select>
            </label>
            <button className="btn-secondary" type="submit">Apply</button>
          </form>
          {filteredLogs.length === 0 ? (
            <EmptyState title="No service logs found" description="Upload your last bill or enter a visit by hand." actionHref="/garage" actionLabel="Add bike first" />
          ) : (
            <div className="overflow-hidden rounded border border-stone-200 bg-white shadow-soft">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-left text-sm">
                  <thead className="bg-paper text-xs uppercase tracking-wide text-steel">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Bike</th>
                      <th className="px-4 py-3">Service</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Odometer</th>
                      <th className="px-4 py-3">Cost</th>
                      <th className="px-4 py-3">Bill</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {filteredLogs.map((log) => {
                      const bike = typedBikes.find((item) => item.id === log.bike_id);
                      return (
                        <tr key={log.id}>
                          <td className="px-4 py-3">{log.service_date}</td>
                          <td className="px-4 py-3">{bike ? `${bike.brand} ${bike.model}` : "Bike"}</td>
                          <td className="px-4 py-3">{log.service_number ? (log.service_number === "post5" ? "Post 5th" : `#${log.service_number}`) : "—"}</td>
                          <td className="px-4 py-3">{titleCase(log.service_type)}</td>
                          <td className="px-4 py-3">{formatKm(log.odometer_km)}</td>
                          <td className="px-4 py-3">{formatInr(Number(log.total_cost ?? 0))}</td>
                          <td className="px-4 py-3">
                            {signedBillUrls.get(log.id) ? (
                              <Link className="inline-flex items-center gap-1 text-leaf" href={signedBillUrls.get(log.id)!} target="_blank">
                                View <ExternalLink className="h-3 w-3" aria-hidden="true" />
                              </Link>
                            ) : "Not uploaded"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
