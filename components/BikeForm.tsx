"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { USAGE_TYPES } from "@/lib/constants/bikes";
import { createClient } from "@/lib/supabase/client";
import type { Bike } from "@/lib/types";
import { titleCase } from "@/lib/utils";

export function BikeForm({ userId, bike }: { userId: string; bike?: Bike }) {
  const router = useRouter();
  const supabase = createClient();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    const payload = {
      user_id: userId,
      brand: String(formData.get("brand") ?? "").trim(),
      model: String(formData.get("model") ?? "").trim(),
      variant: String(formData.get("variant") ?? "").trim() || null,
      manufacturing_year: Number(formData.get("manufacturing_year")) || null,
      purchase_year: Number(formData.get("purchase_year")) || null,
      odometer_km: Number(formData.get("odometer_km")) || 0,
      city: String(formData.get("city") ?? "").trim() || null,
      usage_type: String(formData.get("usage_type") ?? "mixed"),
      has_modifications: formData.get("has_modifications") === "on",
      modification_notes: String(formData.get("modification_notes") ?? "").trim() || null,
      fuel_type: String(formData.get("fuel_type") ?? "petrol").trim() || "petrol"
    };

    if (!payload.brand || !payload.model) {
      setError("Brand and model are required.");
      setLoading(false);
      return;
    }

    const query = bike
      ? supabase.from("bikes").update(payload).eq("id", bike.id)
      : supabase.from("bikes").insert(payload);
    const { error: saveError } = await query;

    if (saveError) {
      setError(saveError.message);
      setLoading(false);
      return;
    }

    router.refresh();
    setLoading(false);
  }

  return (
    <form action={onSubmit} className="panel space-y-4">
      <h2 className="text-lg font-semibold text-ink">{bike ? "Edit bike" : "Add bike"}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <label>
          <span className="label">Brand</span>
          <input className="field mt-1" name="brand" defaultValue={bike?.brand} required placeholder="Royal Enfield" />
        </label>
        <label>
          <span className="label">Model</span>
          <input className="field mt-1" name="model" defaultValue={bike?.model} required placeholder="Classic 350" />
        </label>
        <label>
          <span className="label">Variant</span>
          <input className="field mt-1" name="variant" defaultValue={bike?.variant ?? ""} placeholder="Signals" />
        </label>
        <label>
          <span className="label">Manufacturing year</span>
          <input className="field mt-1" name="manufacturing_year" type="number" min="1990" max="2030" defaultValue={bike?.manufacturing_year ?? ""} />
        </label>
        <label>
          <span className="label">Purchase year</span>
          <input className="field mt-1" name="purchase_year" type="number" min="1990" max="2030" defaultValue={bike?.purchase_year ?? ""} />
        </label>
        <label>
          <span className="label">Odometer</span>
          <input className="field mt-1" name="odometer_km" type="number" min="0" defaultValue={bike?.odometer_km ?? 0} required />
        </label>
        <label>
          <span className="label">City</span>
          <input className="field mt-1" name="city" defaultValue={bike?.city ?? ""} placeholder="Bengaluru" />
        </label>
        <label>
          <span className="label">Usage type</span>
          <select className="field mt-1" name="usage_type" defaultValue={bike?.usage_type ?? "mixed"}>
            {USAGE_TYPES.map((type) => (
              <option key={type} value={type}>
                {titleCase(type)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="label">Fuel type</span>
          <input className="field mt-1" name="fuel_type" defaultValue={bike?.fuel_type ?? "petrol"} />
        </label>
        <label className="flex items-center gap-2 pt-6 text-sm font-medium text-road">
          <input name="has_modifications" type="checkbox" defaultChecked={bike?.has_modifications} />
          Has modifications or accessories
        </label>
      </div>
      <label className="block">
        <span className="label">Modification notes</span>
        <textarea className="field mt-1" name="modification_notes" rows={3} defaultValue={bike?.modification_notes ?? ""} />
      </label>
      {error ? <p className="rounded bg-red-50 p-3 text-sm text-danger">{error}</p> : null}
      <button className="btn-primary" type="submit" disabled={loading}>
        <Save className="h-4 w-4" aria-hidden="true" />
        {loading ? "Saving..." : "Save bike"}
      </button>
    </form>
  );
}
