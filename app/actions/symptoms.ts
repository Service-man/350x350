"use server";

import { revalidatePath } from "next/cache";
import { isDemoSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { loadKundliContext } from "@/lib/kundli/context";
import { deduceSymptom } from "@/lib/kundli/symptom";
import type { ActionState } from "@/lib/types";
import { parseNumber } from "@/lib/utils";

function fail(error: string): ActionState {
  return { ok: false, error, ts: Date.now() };
}

// Note-first: the rider describes what they noticed; component, severity,
// frequency, title and the likely upcoming problem are deduced unless the
// rider set them explicitly under "Add details".
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
  const note = String(formData.get("symptom_description") ?? "").trim();
  const symptomDate = String(formData.get("symptom_date") ?? "") || new Date().toISOString().slice(0, 10);
  if (!bikeId || !note) return fail("Pick the bike and describe what you noticed.");

  const ctx = await loadKundliContext(user.id, bikeId);
  const deduced = await deduceSymptom(note, ctx);

  const manualComponent = String(formData.get("component") ?? "").trim();
  const manualSeverity = String(formData.get("severity") ?? "").trim();
  const manualFrequency = String(formData.get("frequency") ?? "").trim();
  const manualTitle = String(formData.get("symptom_title") ?? "").trim();

  const payload = {
    user_id: user.id,
    bike_id: bikeId,
    symptom_date: symptomDate,
    odometer_km: parseNumber(formData.get("odometer_km")) ?? ctx.bike?.odometer_km ?? null,
    component: manualComponent || deduced.component,
    symptom_title: manualTitle || deduced.title,
    symptom_description: note,
    severity: manualSeverity || deduced.severity,
    frequency: manualFrequency || deduced.frequency,
    resolved: formData.get("resolved") === "on",
    linked_service_log_id: String(formData.get("linked_service_log_id") ?? "") || null,
    predicted_issue: deduced.predicted_issue
  };

  const { error } = await supabase.from("symptom_logs").insert(payload);
  if (error) return fail(error.message);

  revalidatePath("/symptoms");
  revalidatePath("/dashboard");
  revalidatePath("/health");
  revalidatePath("/kundli");
  const message = deduced.predicted_issue
    ? `Logged under ${payload.component}. Likely ahead: ${deduced.predicted_issue}.`
    : `Logged under ${payload.component} (${payload.severity}).`;
  return { ok: true, message, ts: Date.now() };
}
