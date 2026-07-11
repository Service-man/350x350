"use server";

import { revalidatePath } from "next/cache";
import { isDemoSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";
import { parseNumber } from "@/lib/utils";

function fail(error: string): ActionState {
  return { ok: false, error, ts: Date.now() };
}

export async function saveSymptomAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (isDemoSupabaseConfig()) {
    return fail("Demo mode is read-only. Add real Supabase environment variables to save symptom logs.");
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return fail("Your session expired. Please log in again.");

  const bikeId = String(formData.get("bike_id") ?? "");
  const symptomDate = String(formData.get("symptom_date") ?? "");
  const component = String(formData.get("component") ?? "");
  const title = String(formData.get("symptom_title") ?? "").trim();
  if (!bikeId || !symptomDate || !component || !title) {
    return fail("Bike, date, component, and title are required.");
  }

  const payload = {
    user_id: user.id,
    bike_id: bikeId,
    symptom_date: symptomDate,
    odometer_km: parseNumber(formData.get("odometer_km")),
    component,
    symptom_title: title,
    symptom_description: String(formData.get("symptom_description") ?? "").trim() || null,
    severity: String(formData.get("severity") ?? "low"),
    frequency: String(formData.get("frequency") ?? "once"),
    resolved: formData.get("resolved") === "on",
    linked_service_log_id: String(formData.get("linked_service_log_id") ?? "") || null
  };

  const { error } = await supabase.from("symptom_logs").insert(payload);
  if (error) return fail(error.message);

  revalidatePath("/symptoms");
  revalidatePath("/dashboard");
  revalidatePath("/health");
  return { ok: true, ts: Date.now() };
}
