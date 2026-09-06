"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { FileUp, Save } from "lucide-react";
import { saveServiceLogAction } from "@/app/actions/serviceLogs";
import {
  CRUISING_SPEEDS,
  GARAGE_TYPES,
  PILLION_OPTIONS,
  RIDE_FREQUENCIES,
  SERVICE_NUMBERS,
  SERVICE_TYPES,
  USAGE_TYPES,
  USAGE_TYPE_LABELS
} from "@/lib/constants/bikes";
import { createClient } from "@/lib/supabase/client";
import { isDemoSupabaseConfig } from "@/lib/supabase/config";
import type { ActionState, Bike, ServiceLogDraft } from "@/lib/types";
import { titleCase } from "@/lib/utils";

const initialState: ActionState = { ok: false };

type Props = {
  userId: string;
  bikes: Bike[];
  initial?: ServiceLogDraft | null;
  initialFile?: File | null; // a bill already chosen on the upload step
  onSaved?: () => void;
};

// Hybrid write path: the bill file goes browser → Supabase Storage directly
// (avoids server-action payload limits and double bandwidth); only the storage
// path travels to the server action, which validates and inserts the row.
// Riding-pattern fields default from the selected bike and are saved to it.
export function ServiceLogForm({ userId, bikes, initial, initialFile, onSaved }: Props) {
  const [state, dispatch, pending] = useActionState(saveServiceLogAction, initialState);
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [bikeId, setBikeId] = useState(initial?.bike_id ?? bikes[0]?.id ?? "");
  const [parts, setParts] = useState(initial?.parts_replaced ?? "");
  const formRef = useRef<HTMLFormElement>(null);
  const bike = bikes.find((b) => b.id === bikeId);
  const profile = bike?.riding_profile ?? {};

  // A successful save resets the form; the form's onReset clears the
  // controlled parts field, keeping state changes out of the effect body.
  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      onSaved?.();
    }
  }, [state, onSaved]);

  async function uploadBill(file: File, targetBikeId: string) {
    const supabase = createClient();
    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${userId}/${targetBikeId}/${Date.now()}-${cleanName}`;
    const { error } = await supabase.storage.from("service-bills").upload(path, file);
    if (error) throw error;
    return path;
  }

  async function handleSubmit(formData: FormData) {
    setUploadError("");
    const chosen = formData.get("bill_file");
    formData.delete("bill_file"); // never ship file bytes to the action
    const file = chosen instanceof File && chosen.size > 0 ? chosen : initialFile ?? null;

    if (file) {
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
    <form ref={formRef} id="service-log-form" action={handleSubmit} onReset={() => setParts("")} className="panel space-y-5">
      <h2 className="text-lg font-semibold text-ink">{initial ? "Check the details, then save" : "Create service log"}</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <label>
          <span className="label">Bike</span>
          <select className="field mt-1" name="bike_id" required value={bikeId} onChange={(e) => setBikeId(e.target.value)}>
            <option value="">Select bike</option>
            {bikes.map((b) => (
              <option key={b.id} value={b.id}>
                {b.brand} {b.model}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="label">Service no.</span>
          <select className="field mt-1" name="service_number" defaultValue={initial?.service_number ?? ""}>
            <option value="">Not sure</option>
            {SERVICE_NUMBERS.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="label">Service date</span>
          <input className="field mt-1" name="service_date" type="date" required defaultValue={initial?.service_date ?? ""} />
        </label>
        <label>
          <span className="label">Odometer</span>
          <input className="field mt-1" name="odometer_km" type="number" min="0" required defaultValue={initial?.odometer_km ?? bike?.odometer_km ?? ""} />
        </label>
        <label>
          <span className="label">Service type</span>
          <select className="field mt-1" name="service_type" defaultValue={initial?.service_type ?? "periodic"}>
            {SERVICE_TYPES.map((type) => (
              <option key={type} value={type}>{titleCase(type)}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="label">Garage type</span>
          <select className="field mt-1" name="garage_type" defaultValue={initial?.garage_type ?? "independent"}>
            {GARAGE_TYPES.map((type) => (
              <option key={type} value={type}>{titleCase(type)}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="label">Garage name</span>
          <input className="field mt-1" name="garage_name" placeholder="Local garage or dealer" defaultValue={initial?.garage_name ?? ""} />
        </label>
        <label>
          <span className="label">City</span>
          <input className="field mt-1" name="city" placeholder="Pune" defaultValue={initial?.city ?? bike?.city ?? ""} />
        </label>
        <label>
          <span className="label">Total cost</span>
          <input className="field mt-1" name="total_cost" type="number" min="0" defaultValue={initial?.total_cost ?? ""} />
        </label>
        <label>
          <span className="label">Labor cost</span>
          <input className="field mt-1" name="labor_cost" type="number" min="0" defaultValue={initial?.labor_cost ?? ""} />
        </label>
        <label className="md:col-span-2">
          <span className="label">Parts replaced</span>
          <input className="field mt-1" name="parts_replaced" placeholder="Oil filter, brake pads" value={parts} onChange={(e) => setParts(e.target.value)} />
        </label>
        {parts.trim() ? (
          <label className="md:col-span-2">
            <span className="label">Why were they replaced?</span>
            <input className="field mt-1" name="parts_reason" placeholder="Regular wear · failed early · mechanic suggested" defaultValue={initial?.notes?.startsWith("Why replaced: ") ? initial.notes.slice(14) : ""} />
          </label>
        ) : null}
        <label className="md:col-span-2">
          <span className="label">Bill image/PDF</span>
          <span className="mt-1 flex items-center gap-2 rounded border border-dashed border-stone-300 bg-white px-3 py-3 text-sm text-steel">
            <FileUp className="h-4 w-4 text-leaf" aria-hidden="true" />
            {initialFile ? <span className="truncate">{initialFile.name} (attached) — or choose another:</span> : null}
            <input name="bill_file" type="file" accept="image/*,application/pdf" />
          </span>
        </label>
      </div>

      {/* Riding pattern — the questions the kundli needs. Saved to the bike. */}
      <fieldset className="rounded-lg border border-stone-200 bg-paper/60 p-4">
        <legend className="px-1 font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-leaf">How you ride</legend>
        <p className="mb-3 text-[12.5px] text-steel">Helps the kundli judge which parts wear first. Answer once; edit anytime.</p>
        <div className="grid gap-3 md:grid-cols-2">
          <label>
            <span className="label">Most common route</span>
            <select className="field mt-1" name="usage_type" defaultValue={bike?.usage_type ?? ""}>
              <option value="">Not set</option>
              {USAGE_TYPES.map((type) => (
                <option key={type} value={type}>{USAGE_TYPE_LABELS[type]}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="label">Comfortable cruising speed</span>
            <select className="field mt-1" name="cruising_speed" defaultValue={profile.cruising_speed ?? ""}>
              <option value="">Not set</option>
              {CRUISING_SPEEDS.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="label">How often you ride</span>
            <select className="field mt-1" name="ride_frequency" defaultValue={profile.ride_frequency ?? ""}>
              <option value="">Not set</option>
              {RIDE_FREQUENCIES.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="label">Pillion / luggage</span>
            <select className="field mt-1" name="pillion" defaultValue={profile.pillion ?? ""}>
              <option value="">Not set</option>
              {PILLION_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="label">Average km on a riding day</span>
            <input className="field mt-1" name="daily_distance_km" type="number" min="0" placeholder="e.g. 25" defaultValue={profile.daily_distance_km ?? ""} />
          </label>
          <label>
            <span className="label">Average minutes in the saddle per day</span>
            <input className="field mt-1" name="daily_ride_minutes" type="number" min="0" placeholder="e.g. 60" defaultValue={profile.daily_ride_minutes ?? ""} />
          </label>
        </div>
      </fieldset>

      <label className="block">
        <span className="label">Notes</span>
        <textarea className="field mt-1" name="notes" rows={3} defaultValue={initial?.notes && !initial.notes.startsWith("Why replaced: ") ? initial.notes : ""} />
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
