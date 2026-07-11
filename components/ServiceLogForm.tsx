"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { FileUp, Save } from "lucide-react";
import { saveServiceLogAction } from "@/app/actions/serviceLogs";
import { GARAGE_TYPES, SERVICE_TYPES } from "@/lib/constants/bikes";
import { createClient } from "@/lib/supabase/client";
import { isDemoSupabaseConfig } from "@/lib/supabase/config";
import type { ActionState, Bike } from "@/lib/types";
import { titleCase } from "@/lib/utils";

const initialState: ActionState = { ok: false };

// Hybrid write path: the bill file goes browser → Supabase Storage directly
// (avoids server-action payload limits and double bandwidth); only the storage
// path travels to the server action, which validates and inserts the row.
export function ServiceLogForm({ userId, bikes }: { userId: string; bikes: Bike[] }) {
  const [state, dispatch, pending] = useActionState(saveServiceLogAction, initialState);
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  async function uploadBill(file: File, bikeId: string) {
    const supabase = createClient();
    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${userId}/${bikeId}/${Date.now()}-${cleanName}`;
    const { error } = await supabase.storage.from("service-bills").upload(path, file);
    if (error) throw error;
    return path;
  }

  async function handleSubmit(formData: FormData) {
    setUploadError("");
    const file = formData.get("bill_file");
    formData.delete("bill_file"); // never ship file bytes to the action

    if (file instanceof File && file.size > 0) {
      if (isDemoSupabaseConfig()) {
        setUploadError("Demo mode is read-only. Add real Supabase environment variables to upload bills.");
        return;
      }
      try {
        setUploading(true);
        const path = await uploadBill(file, String(formData.get("bike_id") ?? ""));
        formData.set("bill_path", path);
      } catch (error) {
        setUploadError(error instanceof Error ? error.message : "Could not upload the bill file.");
        return;
      } finally {
        setUploading(false);
      }
    }

    dispatch(formData);
  }

  const busy = pending || uploading;
  const errorMessage = uploadError || (!pending ? state.error : undefined);

  return (
    <form ref={formRef} id="service-log-form" action={handleSubmit} className="panel space-y-4">
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
      {errorMessage ? <p className="rounded bg-red-50 p-3 text-sm text-danger">{errorMessage}</p> : null}
      {state.ok && !busy ? <p className="rounded bg-mint p-3 text-sm font-medium text-leaf">Service log saved.</p> : null}
      <button className="btn-primary" disabled={busy || bikes.length === 0} type="submit">
        <Save className="h-4 w-4" aria-hidden="true" />
        {uploading ? "Uploading bill..." : pending ? "Saving..." : "Save service log"}
      </button>
    </form>
  );
}
