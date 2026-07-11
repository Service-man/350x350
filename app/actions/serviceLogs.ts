"use server";

import { revalidatePath } from "next/cache";
import { isDemoSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";
import { parseNumber } from "@/lib/utils";

function fail(error: string): ActionState {
  return { ok: false, error, ts: Date.now() };
}

// The bill file itself is uploaded client-side straight to Supabase Storage
// (RLS-scoped path) so file bytes never round-trip through a server action;
// this action receives only the resulting storage path.
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
    parts_replaced: String(formData.get("parts_replaced") ?? "").trim() || null,
    labor_cost: parseNumber(formData.get("labor_cost")),
    notes: String(formData.get("notes") ?? "").trim() || null,
    bill_file_url: String(formData.get("bill_path") ?? "") || null
  };

  const { error } = await supabase.from("service_logs").insert(payload);
  if (error) return fail(error.message);

  revalidatePath("/service-logs");
  revalidatePath("/garage");
  revalidatePath("/dashboard");
  revalidatePath("/health");
  return { ok: true, ts: Date.now() };
}
