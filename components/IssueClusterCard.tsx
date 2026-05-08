import { TrendingUp } from "lucide-react";
import type { IssueCluster } from "@/lib/types";
import { titleCase } from "@/lib/utils";

export function IssueClusterCard({ issue }: { issue: IssueCluster }) {
  return (
    <article className="rounded border border-stone-200 bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-leaf">
            {issue.bike_brand} {issue.bike_model}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-ink">{issue.issue_title}</h3>
        </div>
        <span className="rounded bg-paper px-2 py-1 text-xs font-semibold text-road">
          {issue.component}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-steel">{issue.issue_summary}</p>
      <div className="mt-5 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
        <span>
          <strong className="block text-ink">{titleCase(issue.severity)}</strong>
          Severity
        </span>
        <span>
          <strong className="block text-ink">{issue.mileage_band}</strong>
          Mileage band
        </span>
        <span>
          <strong className="block text-ink">{issue.mention_count}</strong>
          Mentions
        </span>
        <span className="flex items-start gap-1">
          <TrendingUp className="mt-1 h-4 w-4 text-leaf" aria-hidden="true" />
          <span>
            <strong className="block text-ink">{Number(issue.trend_percentage)}%</strong>
            Trend
          </span>
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <span className="rounded bg-mint px-2 py-1 font-medium text-leaf">
          Confidence: {titleCase(issue.confidence_level)}
        </span>
        <span className="rounded bg-stone-100 px-2 py-1 font-medium text-steel">
          Source: {titleCase(issue.source_type)}
        </span>
      </div>
    </article>
  );
}
