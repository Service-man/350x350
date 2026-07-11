"use server";

import { revalidatePath } from "next/cache";
import { isDemoSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";
import { parseNumber } from "@/lib/utils";

function fail(error: string): ActionState {
  return { ok: false, error, ts: Date.now() };
}

export async function saveBikeAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (isDemoSupabaseConfig()) {
    return fail("Demo mode is read-only. Add real Supabase environment variables to save bikes.");
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return fail("Your session expired. Please log in again.");

  const brand = String(formData.get("brand") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  if (!brand || !model) return fail("Brand and model are required.");

  const payload = {
    user_id: user.id,
    brand,
    model,
    variant: String(formData.get("variant") ?? "").trim() || null,
    manufacturing_year: parseNumber(formData.get("manufacturing_year")),
    purchase_year: parseNumber(formData.get("purchase_year")),
    odometer_km: parseNumber(formData.get("odometer_km")) ?? 0,
    city: String(formData.get("city") ?? "").trim() || null,
    usage_type: String(formData.get("usage_type") ?? "mixed"),
    has_modifications: formData.get("has_modifications") === "on",
    modification_notes: String(formData.get("modification_notes") ?? "").trim() || null,
    fuel_type: String(formData.get("fuel_type") ?? "petrol").trim() || "petrol"
  };

  const bikeId = String(formData.get("bike_id") ?? "");
  const query = bikeId
    ? supabase.from("bikes").update(payload).eq("id", bikeId).eq("user_id", user.id)
    : supabase.from("bikes").insert(payload);
  const { error } = await query;
  if (error) return fail(error.message);

  revalidatePath("/garage");
  revalidatePath("/dashboard");
  revalidatePath("/health");
  return { ok: true, ts: Date.now() };
}
