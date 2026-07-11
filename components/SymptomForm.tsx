"use client";

import { useActionState, useEffect, useRef } from "react";
import { Save } from "lucide-react";
import { saveSymptomAction } from "@/app/actions/symptoms";
import { FREQUENCIES, SEVERITIES } from "@/lib/constants/bikes";
import { COMPONENT_OPTIONS } from "@/lib/constants/components";
import type { ActionState, Bike, ServiceLog } from "@/lib/types";
import { titleCase } from "@/lib/utils";

const initialState: ActionState = { ok: false };

export function SymptomForm({ bikes, serviceLogs }: { bikes: Bike[]; serviceLogs: ServiceLog[] }) {
  const [state, formAction, pending] = useActionState(saveSymptomAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} id="symptom-form" action={formAction} className="panel space-y-4">
      <h2 className="text-lg font-semibold text-ink">Create symptom log</h2>
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
          <span className="label">Symptom date</span>
          <input className="field mt-1" name="symptom_date" type="date" required />
        </label>
        <label>
          <span className="label">Odometer</span>
          <input className="field mt-1" name="odometer_km" type="number" min="0" />
        </label>
        <label>
          <span className="label">Component</span>
          <select className="field mt-1" name="component" required>
            {COMPONENT_OPTIONS.map((component) => (
              <option key={component} value={component}>
                {component}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="label">Severity</span>
          <select className="field mt-1" name="severity" defaultValue="low">
            {SEVERITIES.map((severity) => (
              <option key={severity} value={severity}>
                {titleCase(severity)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="label">Frequency</span>
          <select className="field mt-1" name="frequency" defaultValue="once">
            {FREQUENCIES.map((frequency) => (
              <option key={frequency} value={frequency}>
                {titleCase(frequency)}
              </option>
            ))}
          </select>
        </label>
        <label className="md:col-span-2">
          <span className="label">Title</span>
          <input className="field mt-1" name="symptom_title" required placeholder="Cold start feels weak" />
        </label>
        <label className="md:col-span-2">
          <span className="label">Linked service log</span>
          <select className="field mt-1" name="linked_service_log_id" defaultValue="">
            <option value="">None</option>
            {serviceLogs.map((log) => (
              <option key={log.id} value={log.id}>
                {log.service_date} - {log.service_type}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="block">
        <span className="label">Description</span>
        <textarea className="field mt-1" name="symptom_description" rows={3} />
      </label>
      <label className="flex items-center gap-2 text-sm font-medium text-road">
        <input name="resolved" type="checkbox" />
        Mark as resolved
      </label>
      {state.error && !pending ? <p className="rounded bg-red-50 p-3 text-sm text-danger">{state.error}</p> : null}
      {state.ok && !pending ? <p className="rounded bg-mint p-3 text-sm font-medium text-leaf">Symptom saved.</p> : null}
      <button className="btn-primary" disabled={pending || bikes.length === 0} type="submit">
        <Save className="h-4 w-4" aria-hidden="true" />
        {pending ? "Saving..." : "Save symptom"}
      </button>
    </form>
  );
}
