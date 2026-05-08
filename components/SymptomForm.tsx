"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { FREQUENCIES, SEVERITIES } from "@/lib/constants/bikes";
import { COMPONENT_OPTIONS } from "@/lib/constants/components";
import { createClient } from "@/lib/supabase/client";
import { isDemoSupabaseConfig } from "@/lib/supabase/config";
import type { Bike, ServiceLog } from "@/lib/types";
import { titleCase } from "@/lib/utils";

export function SymptomForm({
  userId,
  bikes,
  serviceLogs
}: {
  userId: string;
  bikes: Bike[];
  serviceLogs: ServiceLog[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    if (isDemoSupabaseConfig()) {
      setError("Demo mode is read-only. Add real Supabase environment variables to save symptom logs.");
      setLoading(false);
      return;
    }

    const payload = {
      user_id: userId,
      bike_id: String(formData.get("bike_id") ?? ""),
      symptom_date: String(formData.get("symptom_date") ?? ""),
      odometer_km: Number(formData.get("odometer_km")) || null,
      component: String(formData.get("component") ?? ""),
      symptom_title: String(formData.get("symptom_title") ?? "").trim(),
      symptom_description: String(formData.get("symptom_description") ?? "").trim() || null,
      severity: String(formData.get("severity") ?? "low"),
      frequency: String(formData.get("frequency") ?? "once"),
      resolved: formData.get("resolved") === "on",
      linked_service_log_id: String(formData.get("linked_service_log_id") ?? "") || null
    };

    if (!payload.bike_id || !payload.symptom_date || !payload.component || !payload.symptom_title) {
      setError("Bike, date, component, and title are required.");
      setLoading(false);
      return;
    }

    const { error: saveError } = await supabase.from("symptom_logs").insert(payload);
    if (saveError) {
      setError(saveError.message);
      setLoading(false);
      return;
    }

    router.refresh();
    (document.getElementById("symptom-form") as HTMLFormElement | null)?.reset();
    setLoading(false);
  }

  return (
    <form id="symptom-form" action={onSubmit} className="panel space-y-4">
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
      {error ? <p className="rounded bg-red-50 p-3 text-sm text-danger">{error}</p> : null}
      <button className="btn-primary" disabled={loading || bikes.length === 0} type="submit">
        <Save className="h-4 w-4" aria-hidden="true" />
        {loading ? "Saving..." : "Save symptom"}
      </button>
    </form>
  );
}
