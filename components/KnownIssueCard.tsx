import { AlertTriangle, CalendarRange, ExternalLink, Eye, Factory, GaugeCircle, Wrench } from "lucide-react";
import Link from "next/link";
import type { KnownIssue } from "@/lib/types";
import { cn, titleCase } from "@/lib/utils";

const severityStyles: Record<string, string> = {
  critical: "border-danger bg-red-50 text-danger",
  high: "border-danger bg-red-50 text-danger",
  medium: "border-amberline bg-amber-50 text-amber-700",
  low: "border-leaf bg-mint text-leaf"
};

const sourceLabels: Record<string, string> = {
  seed: "Curated",
  youtube: "YouTube API",
  reddit: "Reddit API",
  rss: "RSS feed",
  oem: "OEM bulletin",
  community: "Community"
};

function formatCostBand(min: number | null, max: number | null) {
  if (min === null && max === null) return null;
  const fmt = new Intl.NumberFormat("en-IN");
  if (min !== null && max !== null) {
    if (min === 0 && max === 0) return "Usually free to address";
    return `₹${fmt.format(min)}–₹${fmt.format(max)}`;
  }
  return `~₹${fmt.format((min ?? max)!)}`;
}

export function KnownIssueCard({ issue, showModel = false }: { issue: KnownIssue; showModel?: boolean }) {
  const costBand = formatCostBand(issue.typical_cost_min, issue.typical_cost_max);
  const mfgWindow =
    issue.mfg_year_start !== null
      ? issue.mfg_year_end !== null && issue.mfg_year_end !== issue.mfg_year_start
        ? `${issue.mfg_year_start}–${issue.mfg_year_end} builds`
        : `${issue.mfg_year_start} builds`
      : null;

  return (
    <article className="rounded border border-stone-200 bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {showModel ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-leaf">
              {issue.brand} {issue.model}
            </p>
          ) : null}
          <h3 className={cn("text-lg font-semibold text-ink", showModel && "mt-1")}>{issue.issue_title}</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded bg-paper px-2 py-1 text-xs font-semibold text-road">{issue.component}</span>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded border px-2 py-1 text-xs font-semibold",
              severityStyles[issue.severity] ?? severityStyles.low
            )}
          >
            <AlertTriangle className="h-3 w-3" aria-hidden="true" />
            {titleCase(issue.severity)}
          </span>
        </div>
      </div>
      {issue.issue_summary ? <p className="mt-3 text-sm leading-6 text-steel">{issue.issue_summary}</p> : null}
      <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-road">
        {issue.mileage_band ? (
          <span className="inline-flex items-center gap-1 rounded bg-paper px-2 py-1">
            <GaugeCircle className="h-3 w-3 text-leaf" aria-hidden="true" />
            {issue.mileage_band}
          </span>
        ) : null}
        {issue.rpm_band ? (
          <span className="inline-flex items-center gap-1 rounded bg-paper px-2 py-1">
            <GaugeCircle className="h-3 w-3 text-amberline" aria-hidden="true" />
            {issue.rpm_band}
          </span>
        ) : null}
        {mfgWindow ? (
          <span className="inline-flex items-center gap-1 rounded bg-paper px-2 py-1">
            <Factory className="h-3 w-3 text-leaf" aria-hidden="true" />
            {mfgWindow}
          </span>
        ) : null}
        {issue.service_checkpoint_km !== null ? (
          <span className="inline-flex items-center gap-1 rounded bg-paper px-2 py-1">
            <CalendarRange className="h-3 w-3 text-leaf" aria-hidden="true" />
            ~{new Intl.NumberFormat("en-IN").format(issue.service_checkpoint_km)} km checkpoint
          </span>
        ) : null}
      </div>
      <div className="mt-4 space-y-3 text-sm">
        {issue.symptoms_to_watch ? (
          <p className="flex gap-2 text-steel">
            <Eye className="mt-0.5 h-4 w-4 shrink-0 text-amberline" aria-hidden="true" />
            <span>
              <strong className="text-ink">Watch for:</strong> {issue.symptoms_to_watch}
            </span>
          </p>
        ) : null}
        {issue.preventive_action ? (
          <p className="flex gap-2 text-steel">
            <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-leaf" aria-hidden="true" />
            <span>
              <strong className="text-ink">Do this:</strong> {issue.preventive_action}
            </span>
          </p>
        ) : null}
        {costBand ? (
          <p className="rounded bg-paper p-2 text-sm font-medium text-road">Typical cost: {costBand}</p>
        ) : null}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded bg-mint px-2 py-1 font-medium text-leaf">
          Confidence: {titleCase(issue.confidence_level)}
        </span>
        <span className="rounded bg-stone-100 px-2 py-1 font-medium text-steel">
          {issue.mention_count} mentions
        </span>
        {issue.source_url ? (
          <Link
            className="inline-flex items-center gap-1 rounded bg-stone-100 px-2 py-1 font-medium text-steel hover:text-leaf"
            href={issue.source_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Source: {sourceLabels[issue.source_type] ?? titleCase(issue.source_type)}
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </Link>
        ) : (
          <span className="rounded bg-stone-100 px-2 py-1 font-medium text-steel">
            Source: {sourceLabels[issue.source_type] ?? titleCase(issue.source_type)}
          </span>
        )}
        {issue.last_verified_at ? (
          <span className="text-steel">
            Verified {new Date(issue.last_verified_at).toLocaleDateString("en-IN", { year: "numeric", month: "short" })}
          </span>
        ) : null}
      </div>
    </article>
  );
}
