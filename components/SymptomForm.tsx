"use client";

import { useActionState, useEffect, useRef } from "react";
import { Save } from "lucide-react";
import { saveSymptomAction } from "@/app/actions/symptoms";
import { FREQUENCIES, SEVERITIES } from "@/lib/constants/bikes";
import { COMPONENT_OPTIONS } from "@/lib/constants/components";
import type { ActionState, Bike, ServiceLog } from "@/lib/types";
import { titleCase } from "@/lib/utils";

const initialState: ActionState = { ok: false };

// Note-first: one textarea is the whole form. The system works out the
// component, severity, and the likely upcoming problem; the structured
// fields are tucked away for riders who want to set them by hand.
export function SymptomForm({ bikes, serviceLogs }: { bikes: Bike[]; serviceLogs: ServiceLog[] }) {
  const [state, formAction, pending] = useActionState(saveSymptomAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} id="symptom-form" action={formAction} className="panel space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-ink">What did you notice?</h2>
        <p className="mt-1 text-[13px] text-steel">Write it the way you&apos;d tell a mechanic. We&apos;ll work out the part, how serious it is, and what it usually leads to on your model.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label>
          <span className="label">Bike</span>
          <select className="field mt-1" name="bike_id" required defaultValue={bikes[0]?.id ?? ""}>
            <option value="">Select bike</option>
            {bikes.map((bike) => (
              <option key={bike.id} value={bike.id}>
                {bike.brand} {bike.model}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="label">When</span>
          <input className="field mt-1" name="symptom_date" type="date" defaultValue={today} required />
        </label>
      </div>
      <label className="block">
        <span className="label">Your note</span>
        <textarea
          className="field mt-1 min-h-[120px]"
          name="symptom_description"
          rows={4}
          required
          placeholder="e.g. Starter feels slow in the morning after I used the aux lights the night before. Happens most days now."
        />
      </label>

      <details className="rounded-lg border border-stone-200 bg-paper/60 p-3">
        <summary className="cursor-pointer text-[13px] font-bold text-leaf">Add details manually (optional)</summary>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label>
            <span className="label">Odometer</span>
            <input className="field mt-1" name="odometer_km" type="number" min="0" placeholder="Current km" />
          </label>
          <label>
            <span className="label">Component</span>
            <select className="field mt-1" name="component" defaultValue="">
              <option value="">Let the system decide</option>
              {COMPONENT_OPTIONS.map((component) => (
                <option key={component} value={component}>{component}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="label">Severity</span>
            <select className="field mt-1" name="severity" defaultValue="">
              <option value="">Auto</option>
              {SEVERITIES.map((severity) => (
                <option key={severity} value={severity}>{titleCase(severity)}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="label">Frequency</span>
            <select className="field mt-1" name="frequency" defaultValue="">
              <option value="">Auto</option>
              {FREQUENCIES.map((frequency) => (
                <option key={frequency} value={frequency}>{titleCase(frequency)}</option>
              ))}
            </select>
          </label>
          <label className="md:col-span-2">
            <span className="label">Short title</span>
            <input className="field mt-1" name="symptom_title" placeholder="Auto from your note" />
          </label>
          <label className="md:col-span-2">
            <span className="label">Linked service log</span>
            <select className="field mt-1" name="linked_service_log_id" defaultValue="">
              <option value="">None</option>
              {serviceLogs.map((log) => (
                <option key={log.id} value={log.id}>{log.service_date} - {log.service_type}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-road md:col-span-2">
            <input name="resolved" type="checkbox" />
            Already resolved
          </label>
        </div>
      </details>

      {state.error && !pending ? <p className="rounded bg-red-50 p-3 text-sm text-danger">{state.error}</p> : null}
      {state.ok && !pending ? <p className="rounded bg-mint p-3 text-sm font-medium text-leaf">{state.message ?? "Symptom saved."}</p> : null}
      <button className="btn-primary" disabled={pending || bikes.length === 0} type="submit">
        <Save className="h-4 w-4" aria-hidden="true" />
        {pending ? "Reading…" : "Save note"}
      </button>
    </form>
  );
}
