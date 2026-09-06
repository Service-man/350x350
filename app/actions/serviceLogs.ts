"use server";

import { revalidatePath } from "next/cache";
import { isDemoSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { ActionState, Bike, RidingProfile, ServiceNumber, UsageType } from "@/lib/types";
import { parseNumber } from "@/lib/utils";

function fail(error: string): ActionState {
  return { ok: false, error, ts: Date.now() };
}

const SERVICE_NUMBER_VALUES: ServiceNumber[] = ["1", "2", "3", "4", "5", "post5"];
const USAGE_VALUES: UsageType[] = ["city", "highway", "touring", "offroad", "mixed"];

// The bill file itself is uploaded client-side straight to Supabase Storage
// (RLS-scoped path) so file bytes never round-trip through a server action;
// this action receives only the resulting storage path. Riding-pattern
// answers on the same form are written to the bike, not the log.
export async function saveServiceLogAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (isDemoSupabaseConfig()) {
    return fail("Demo mode is read-only. Add real Supabase environment variables to save service logs.");
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return fail("Your session expired. Please log in again.");

  const bikeId = String(formData.get("bike_id") ?? "");
  const serviceDate = String(formData.get("service_date") ?? "");
  const odometer = parseNumber(formData.get("odometer_km"));
  if (!bikeId || !serviceDate || odometer === null) {
    return fail("Bike, service date, and odometer are required.");
  }

  const serviceNumberRaw = String(formData.get("service_number") ?? "");
  const serviceNumber = SERVICE_NUMBER_VALUES.includes(serviceNumberRaw as ServiceNumber) ? (serviceNumberRaw as ServiceNumber) : null;

  const partsReplaced = String(formData.get("parts_replaced") ?? "").trim() || null;
  const partsReason = String(formData.get("parts_reason") ?? "").trim();
  const notesRaw = String(formData.get("notes") ?? "").trim();
  const notes = [partsReplaced && partsReason ? `Why replaced: ${partsReason}` : null, notesRaw || null].filter(Boolean).join("\n") || null;

  const payload = {
    user_id: user.id,
    bike_id: bikeId,
    service_date: serviceDate,
    odometer_km: odometer,
    service_type: String(formData.get("service_type") ?? "periodic"),
    garage_type: String(formData.get("garage_type") ?? "independent"),
    garage_name: String(formData.get("garage_name") ?? "").trim() || null,
    city: String(formData.get("city") ?? "").trim() || null,
    total_cost: parseNumber(formData.get("total_cost")),
    parts_replaced: partsReplaced,
    labor_cost: parseNumber(formData.get("labor_cost")),
    notes,
    bill_file_url: String(formData.get("bill_path") ?? "") || null,
    service_number: serviceNumber
  };

  const { error } = await supabase.from("service_logs").insert(payload);
  if (error) return fail(error.message);

  // Riding pattern → bike. Only fields the rider actually filled are written.
  const profilePatch: Partial<RidingProfile> = {};
  const cruising = String(formData.get("cruising_speed") ?? "");
  if (["40-60", "60-80", "80-100", "100+"].includes(cruising)) profilePatch.cruising_speed = cruising as RidingProfile["cruising_speed"];
  const frequency = String(formData.get("ride_frequency") ?? "");
  if (["daily", "weekdays", "weekends", "occasional"].includes(frequency)) profilePatch.ride_frequency = frequency as RidingProfile["ride_frequency"];
  const dailyKm = parseNumber(formData.get("daily_distance_km"));
  if (dailyKm !== null) profilePatch.daily_distance_km = dailyKm;
  const dailyMinutes = parseNumber(formData.get("daily_ride_minutes"));
  if (dailyMinutes !== null) profilePatch.daily_ride_minutes = dailyMinutes;
  const pillion = String(formData.get("pillion") ?? "");
  if (["rarely", "sometimes", "often"].includes(pillion)) profilePatch.pillion = pillion as RidingProfile["pillion"];
  const usageRaw = String(formData.get("usage_type") ?? "");
  const usageType = USAGE_VALUES.includes(usageRaw as UsageType) ? (usageRaw as UsageType) : null;

  const bikeUpdate: Record<string, unknown> = {};
  // Keep the bike's odometer current when the service reading is newer.
  const { data: bikeRow } = await supabase.from("bikes").select("odometer_km, riding_profile").eq("id", bikeId).eq("user_id", user.id).maybeSingle();
  const bike = bikeRow as Pick<Bike, "odometer_km" | "riding_profile"> | null;
  if (bike && odometer > (bike.odometer_km ?? 0)) bikeUpdate.odometer_km = odometer;
  if (Object.keys(profilePatch).length > 0) bikeUpdate.riding_profile = { ...(bike?.riding_profile ?? {}), ...profilePatch };
  if (usageType) bikeUpdate.usage_type = usageType;
  if (Object.keys(bikeUpdate).length > 0) {
    await supabase.from("bikes").update(bikeUpdate).eq("id", bikeId).eq("user_id", user.id);
  }

  revalidatePath("/service-logs");
  revalidatePath("/garage");
  revalidatePath("/dashboard");
  revalidatePath("/health");
  revalidatePath("/kundli");
  return { ok: true, ts: Date.now() };
}
