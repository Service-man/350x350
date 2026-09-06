import { createClient } from "@/lib/supabase/server";
import { isDemoSupabaseConfig } from "@/lib/supabase/config";
import { getKnownIssues } from "@/lib/knowledge/getKnownIssues";
import { calculateRiskScores } from "@/lib/risk/riskScoring";
import { demoBikes, demoServiceLogs, demoSymptoms } from "@/lib/demo/data";
import type { Bike, RidingProfile, ServiceLog, SymptomLog, UsageType } from "@/lib/types";
import type { KundliContext } from "./reading";

// Everything the kundli needs to read one rider's bike. Demo mode serves the
// demo garage; real mode reads the caller's rows under RLS.
export async function loadKundliContext(userId: string, bikeId?: string | null): Promise<KundliContext> {
  let bikes: Bike[] = demoBikes;
  let serviceLogs: ServiceLog[] = demoServiceLogs;
  let symptoms: SymptomLog[] = demoSymptoms;

  if (!isDemoSupabaseConfig()) {
    const supabase = await createClient();
    const [{ data: b = [] }, { data: s = [] }, { data: y = [] }] = await Promise.all([
      supabase.from("bikes").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("service_logs").select("*").eq("user_id", userId).order("service_date", { ascending: false }),
      supabase.from("symptom_logs").select("*").eq("user_id", userId).order("symptom_date", { ascending: false })
    ]);
    bikes = (b as Bike[]).map((bike) => ({ ...bike, riding_profile: bike.riding_profile ?? {} }));
    serviceLogs = s as ServiceLog[];
    symptoms = y as SymptomLog[];
  }

  const bike = (bikeId ? bikes.find((item) => item.id === bikeId) : null) ?? bikes[0] ?? null;
  const knownIssues = bike ? await getKnownIssues({ brand: bike.brand, model: bike.model }) : [];
  const risks = bike ? calculateRiskScores(bike, symptoms, serviceLogs) : [];

  return { bike, bikes, serviceLogs, symptoms, knownIssues, risks };
}

export const PROFILE_FIELDS = ["cruising_speed", "ride_frequency", "daily_distance_km", "daily_ride_minutes", "pillion"] as const;
export type ProfileField = (typeof PROFILE_FIELDS)[number];

export function isProfileField(field: string): field is ProfileField {
  return (PROFILE_FIELDS as readonly string[]).includes(field);
}

// Persist a riding-pattern answer (and optionally the route) on the bike.
// No-op in demo mode — the chat carries the answers client-side instead.
export async function updateRidingProfile(
  userId: string,
  bike: Bike,
  patch: Partial<RidingProfile>,
  usageType?: UsageType | null
): Promise<RidingProfile> {
  const merged: RidingProfile = { ...(bike.riding_profile ?? {}), ...patch };
  if (isDemoSupabaseConfig()) return merged;
  const supabase = await createClient();
  const update: Record<string, unknown> = { riding_profile: merged };
  if (usageType) update.usage_type = usageType;
  await supabase.from("bikes").update(update).eq("id", bike.id).eq("user_id", userId);
  return merged;
}
