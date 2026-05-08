"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileUp, Save } from "lucide-react";
import { GARAGE_TYPES, SERVICE_TYPES } from "@/lib/constants/bikes";
import { createClient } from "@/lib/supabase/client";
import { isDemoSupabaseConfig } from "@/lib/supabase/config";
import type { Bike } from "@/lib/types";
import { titleCase } from "@/lib/utils";

export function ServiceLogForm({ userId, bikes }: { userId: string; bikes: Bike[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function uploadBill(file: File, bikeId: string) {
    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${userId}/${bikeId}/${Date.now()}-${cleanName}`;
    const { error: uploadError } = await supabase.storage.from("service-bills").upload(path, file);
    if (uploadError) throw uploadError;
    return path;
  }

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    if (isDemoSupabaseConfig()) {
      setError("Demo mode is read-only. Add real Supabase environment variables to save service logs and bills.");
      setLoading(false);
      return;
    }

    const bikeId = String(formData.get("bike_id") ?? "");
    const file = formData.get("bill_file");

    try {
      let billUrl: string | null = null;
      if (file instanceof File && file.size > 0) {
        billUrl = await uploadBill(file, bikeId);
      }

      const payload = {
        user_id: userId,
        bike_id: bikeId,
        service_date: String(formData.get("service_date") ?? ""),
        odometer_km: Number(formData.get("odometer_km")),
        service_type: String(formData.get("service_type") ?? "periodic"),
        garage_type: String(formData.get("garage_type") ?? "independent"),
        garage_name: String(formData.get("garage_name") ?? "").trim() || null,
        city: String(formData.get("city") ?? "").trim() || null,
        total_cost: Number(formData.get("total_cost")) || null,
        parts_replaced: String(formData.get("parts_replaced") ?? "").trim() || null,
        labor_cost: Number(formData.get("labor_cost")) || null,
        notes: String(formData.get("notes") ?? "").trim() || null,
        bill_file_url: billUrl
      };

      if (!payload.bike_id || !payload.service_date || !payload.odometer_km) {
        throw new Error("Bike, service date, and odometer are required.");
      }

      const { error: saveError } = await supabase.from("service_logs").insert(payload);
      if (saveError) throw saveError;
      router.refresh();
      (document.getElementById("service-log-form") as HTMLFormElement | null)?.reset();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save service log.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form id="service-log-form" action={onSubmit} className="panel space-y-4">
      <h2 className="text-lg font-semibold text-ink">Create service log</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <label>
          <span className="label">Bike</span>
          <select className="field mt-1" name="bike_id" required>
            <option value="">Select bike</option>
            {bikes.map((bike) => (
              <option key={bike.id} value={bike.id}>
                {bike.brand} {bike.model}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="label">Service date</span>
          <input className="field mt-1" name="service_date" type="date" required />
        </label>
        <label>
          <span className="label">Odometer</span>
          <input className="field mt-1" name="odometer_km" type="number" min="0" required />
        </label>
        <label>
          <span className="label">Service type</span>
          <select className="field mt-1" name="service_type" defaultValue="periodic">
            {SERVICE_TYPES.map((type) => (
              <option key={type} value={type}>
                {titleCase(type)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="label">Garage type</span>
          <select className="field mt-1" name="garage_type" defaultValue="independent">
            {GARAGE_TYPES.map((type) => (
              <option key={type} value={type}>
                {titleCase(type)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="label">Garage name</span>
          <input className="field mt-1" name="garage_name" placeholder="Local garage or dealer" />
        </label>
        <label>
          <span className="label">City</span>
          <input className="field mt-1" name="city" placeholder="Pune" />
        </label>
        <label>
          <span className="label">Total cost</span>
          <input className="field mt-1" name="total_cost" type="number" min="0" />
        </label>
        <label>
          <span className="label">Labor cost</span>
          <input className="field mt-1" name="labor_cost" type="number" min="0" />
        </label>
        <label className="md:col-span-2">
          <span className="label">Parts replaced</span>
          <input className="field mt-1" name="parts_replaced" placeholder="Oil filter, brake pads" />
        </label>
        <label className="md:col-span-2">
          <span className="label">Bill image/PDF</span>
          <span className="mt-1 flex items-center gap-2 rounded border border-dashed border-stone-300 bg-white px-3 py-3 text-sm text-steel">
            <FileUp className="h-4 w-4 text-leaf" aria-hidden="true" />
            <input name="bill_file" type="file" accept="image/*,application/pdf" />
          </span>
        </label>
      </div>
      <label className="block">
        <span className="label">Notes</span>
        <textarea className="field mt-1" name="notes" rows={3} />
      </label>
      {error ? <p className="rounded bg-red-50 p-3 text-sm text-danger">{error}</p> : null}
      <button className="btn-primary" disabled={loading || bikes.length === 0} type="submit">
        <Save className="h-4 w-4" aria-hidden="true" />
        {loading ? "Saving..." : "Save service log"}
      </button>
    </form>
  );
}
