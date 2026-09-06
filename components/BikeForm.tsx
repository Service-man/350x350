"use client";

import { useActionState, useEffect, useRef } from "react";
import { Save } from "lucide-react";
import { saveBikeAction } from "@/app/actions/bikes";
import { USAGE_TYPES, USAGE_TYPE_LABELS } from "@/lib/constants/bikes";
import type { ActionState, Bike } from "@/lib/types";

const initialState: ActionState = { ok: false };

export function BikeForm({ bike }: { bike?: Bike }) {
  const [state, formAction, pending] = useActionState(saveBikeAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the add-bike form after a successful save; keep edit values in place.
  useEffect(() => {
    if (state.ok && !bike) formRef.current?.reset();
  }, [state, bike]);

  return (
    <form ref={formRef} action={formAction} className="panel space-y-4">
      <h2 className="text-lg font-semibold text-ink">{bike ? "Edit bike" : "Add bike"}</h2>
      {bike ? <input type="hidden" name="bike_id" value={bike.id} /> : null}
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
          <span className="label">Most common route</span>
          <select className="field mt-1" name="usage_type" defaultValue={bike?.usage_type ?? "mixed"}>
            {USAGE_TYPES.map((type) => (
              <option key={type} value={type}>
                {USAGE_TYPE_LABELS[type]}
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
      {state.error && !pending ? <p className="rounded bg-red-50 p-3 text-sm text-danger">{state.error}</p> : null}
      {state.ok && !pending ? <p className="rounded bg-mint p-3 text-sm font-medium text-leaf">Saved.</p> : null}
      <button className="btn-primary" type="submit" disabled={pending}>
        <Save className="h-4 w-4" aria-hidden="true" />
        {pending ? "Saving..." : "Save bike"}
      </button>
    </form>
  );
}
