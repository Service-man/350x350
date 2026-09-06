"use client";

import { useRef, useState } from "react";
import { FileUp, PenLine, Sparkles } from "lucide-react";
import { ServiceLogForm } from "@/components/ServiceLogForm";
import type { Bike, ServiceLogDraft } from "@/lib/types";

type Props = {
  userId: string;
  bikes: Bike[];
  initialDraft?: ServiceLogDraft | null;
  initialOpen?: boolean;
};

// Upload-first entry: the manual form stays hidden until either a bill has
// been read or the rider explicitly chooses to type it in.
export function ServiceLogEntry({ userId, bikes, initialDraft = null, initialOpen = false }: Props) {
  const [mode, setMode] = useState<"upload" | "form">(initialOpen ? "form" : "upload");
  const [draft, setDraft] = useState<ServiceLogDraft | null>(initialDraft);
  const [file, setFile] = useState<File | null>(null);
  const [via, setVia] = useState<"llm" | "rules" | "none" | null>(null);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function readBill(chosen: File) {
    setError("");
    setReading(true);
    setFile(chosen);
    try {
      const form = new FormData();
      form.set("file", chosen);
      const response = await fetch("/api/service-logs/extract", { method: "POST", body: form });
      const data = (await response.json()) as { draft?: ServiceLogDraft; via?: "llm" | "rules" | "none"; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Could not read the bill.");
      const matched = data.draft?.model ? bikes.find((b) => b.model.toLowerCase() === data.draft!.model!.toLowerCase()) : undefined;
      setDraft({ ...(data.draft ?? {}), bike_id: matched?.id ?? bikes[0]?.id ?? null });
      setVia(data.via ?? "none");
      setMode("form");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read the bill.");
    } finally {
      setReading(false);
    }
  }

  if (mode === "form") {
    const found = draft
      ? [draft.service_date, draft.odometer_km ? `${draft.odometer_km} km` : null, draft.total_cost ? `₹${draft.total_cost}` : null, draft.parts_replaced].filter(Boolean)
      : [];
    return (
      <div className="space-y-3">
        {via ? (
          <p className="rounded-lg border border-leaf/30 bg-mint/60 px-4 py-3 text-[13px] text-ink">
            <Sparkles className="mr-1.5 inline h-4 w-4 text-leaf" aria-hidden="true" />
            {via === "none"
              ? "Bill attached. Reading photos needs the AI key — fill in the details below and the bill will still be saved with the log."
              : found.length
                ? `Read from your bill: ${found.join(" · ")}. Check and correct anything below.`
                : "Bill attached, but the key numbers weren't clear — fill them in below."}
          </p>
        ) : null}
        <ServiceLogForm userId={userId} bikes={bikes} initial={draft} initialFile={file} onSaved={() => { setDraft(null); setFile(null); setVia(null); }} />
        <button type="button" className="text-[13px] font-bold text-steel hover:text-ink" onClick={() => { setMode("upload"); setDraft(null); setFile(null); setVia(null); }}>
          ← Back to upload
        </button>
      </div>
    );
  }

  return (
    <div className="panel space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-ink">Log a service</h2>
        <p className="mt-1 text-[13px] text-steel">Upload the bill and we&apos;ll read the date, km, cost and parts for you.</p>
      </div>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,application/pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) readBill(f); }} />
      <button
        type="button"
        className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-leaf/40 bg-mint/40 px-4 py-10 text-center transition hover:border-leaf hover:bg-mint/70 disabled:opacity-60"
        onClick={() => inputRef.current?.click()}
        disabled={reading || bikes.length === 0}
      >
        <FileUp className="h-8 w-8 text-leaf" aria-hidden="true" />
        <span className="font-bold text-ink">{reading ? "Reading your bill…" : "Upload service bill"}</span>
        <span className="text-[12.5px] text-steel">Photo (JPG/PNG) or PDF · up to 4 MB</span>
      </button>
      {error ? <p className="rounded bg-red-50 p-3 text-sm text-danger">{error}</p> : null}
      {bikes.length === 0 ? <p className="text-[13px] text-steel">Add a bike in the Garage first.</p> : null}
      <button type="button" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-leaf hover:text-[#4C1D95]" onClick={() => { setDraft(null); setMode("form"); }} disabled={bikes.length === 0}>
        <PenLine className="h-4 w-4" aria-hidden="true" /> Or enter the details manually
      </button>
    </div>
  );
}
