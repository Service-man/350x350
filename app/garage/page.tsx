import { AppShell } from "@/components/AppShell";
import { BikeCard } from "@/components/BikeCard";
import { BikeForm } from "@/components/BikeForm";
import { EmptyState } from "@/components/EmptyState";
import { requireUser, createClient } from "@/lib/supabase/server";
import { isDemoSupabaseConfig } from "@/lib/supabase/config";
import { demoBikes, demoServiceLogs } from "@/lib/demo/data";
import type { Bike, ServiceLog } from "@/lib/types";

export default async function GaragePage() {
  const user = await requireUser();
  let typedBikes: Bike[] = demoBikes;
  let typedServices: ServiceLog[] = demoServiceLogs;

  if (!isDemoSupabaseConfig()) {
    const supabase = await createClient();
    const [{ data: bikes = [] }, { data: services = [] }] = await Promise.all([
      supabase.from("bikes").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("service_logs").select("*").eq("user_id", user.id).order("service_date", { ascending: false })
    ]);
    typedBikes = bikes as Bike[];
    typedServices = services as ServiceLog[];
  }

  return (
    <AppShell title="Bike Garage" subtitle="Add and maintain basic details for every motorcycle you track.">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <BikeForm userId={user.id} />
        <section>
          <h2 className="mb-4 text-lg font-semibold text-ink">Your bikes</h2>
          {typedBikes.length === 0 ? (
            <EmptyState title="No bikes yet" description="Add your first bike to start logging service history and symptoms." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {typedBikes.map((bike) => (
                <div key={bike.id} className="space-y-3">
                  <BikeCard bike={bike} lastService={typedServices.find((log) => log.bike_id === bike.id)} />
                  <details className="rounded border border-stone-200 bg-white p-4">
                    <summary className="cursor-pointer text-sm font-semibold text-leaf">Edit details</summary>
                    <div className="mt-4">
                      <BikeForm userId={user.id} bike={bike} />
                    </div>
                  </details>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
