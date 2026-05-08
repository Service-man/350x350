import { Cable, FileText, MessageSquare, ShieldX, Smartphone, Youtube } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/supabase/server";

const sources = [
  { title: "User service bills", status: "Ready", icon: FileText, note: "Manual upload with metadata. OCR comes later." },
  { title: "Manual symptom logs", status: "Ready", icon: MessageSquare, note: "Structured rider-submitted first-party data." },
  { title: "YouTube comments", status: "Future API integration", icon: Youtube, note: "Use official API and quota controls only." },
  { title: "Reddit", status: "Future compliant API integration", icon: MessageSquare, note: "Use compliant API access, no unofficial scraping." },
  { title: "Facebook/Instagram", status: "Avoid scraping", icon: ShieldX, note: "Use partnerships or owned communities instead." },
  { title: "OBD dongle", status: "Phase 2", icon: Cable, note: "Optional integration after manual logs prove value." }
];

export default async function DataSourcesPage() {
  await requireUser();

  return (
    <AppShell title="Data Sources" subtitle="The ingestion roadmap is explicit: first-party data first, compliant APIs later, no unofficial scraping.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sources.map((source) => {
          const Icon = source.icon ?? Smartphone;
          return (
            <article key={source.title} className="rounded border border-stone-200 bg-white p-5 shadow-soft">
              <Icon className="h-6 w-6 text-leaf" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-semibold text-ink">{source.title}</h2>
              <p className="mt-2 text-sm font-semibold text-leaf">{source.status}</p>
              <p className="mt-3 text-sm leading-6 text-steel">{source.note}</p>
            </article>
          );
        })}
      </div>
    </AppShell>
  );
}
