import { AlertTriangle, CheckCircle2, Gauge } from "lucide-react";
import type { ComponentRiskScore } from "@/lib/risk/riskScoring";
import { cn } from "@/lib/utils";

export function RiskScoreCard({ risk }: { risk: ComponentRiskScore }) {
  const color =
    risk.level === "High"
      ? "border-danger bg-red-50 text-danger"
      : risk.level === "Medium"
        ? "border-amberline bg-amber-50 text-amber-700"
        : "border-leaf bg-mint text-leaf";
  const Icon = risk.level === "Low" ? CheckCircle2 : risk.level === "Medium" ? Gauge : AlertTriangle;

  return (
    <article className="rounded border border-stone-200 bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="label">{risk.component}</p>
          <h3 className="mt-2 text-3xl font-semibold text-ink">{risk.score}</h3>
        </div>
        <span className={cn("inline-flex items-center gap-2 rounded border px-3 py-1 text-sm font-semibold", color)}>
          <Icon className="h-4 w-4" aria-hidden="true" />
          {risk.level}
        </span>
      </div>
      <ul className="mt-4 space-y-2 text-sm text-steel">
        {risk.reasons.map((reason) => (
          <li key={reason}>• {reason}</li>
        ))}
      </ul>
      <p className="mt-4 rounded bg-paper p-3 text-sm font-medium text-road">{risk.recommendedAction}</p>
    </article>
  );
}
