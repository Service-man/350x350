import type { ComponentRiskScore } from "@/lib/risk/riskScoring";
import { cn } from "@/lib/utils";

export function RiskScoreCard({ risk }: { risk: ComponentRiskScore }) {
  const high = risk.level === "High";
  const pill = high
    ? "border-danger/50 text-danger"
    : risk.level === "Medium"
      ? "border-stone-400 text-leaf"
      : "border-stone-300 text-steel";
  const width = Math.max(4, Math.min(100, risk.score));

  return (
    <article className="rounded-[10px] bg-paper p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-road">
          {risk.component}
        </p>
        <span className={cn("rounded-full border px-2.5 py-0.5 text-[11px] font-extrabold uppercase", pill)}>
          {risk.level}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[26px] font-black text-ink">{risk.score}</span>
        <div className="h-1.5 flex-1 rounded-full bg-stone-300/70">
          <div
            className={cn(
              "h-1.5 rounded-full",
              high ? "bg-gradient-to-r from-danger to-red-400" : "bg-gradient-to-r from-leaf to-glow"
            )}
            style={{ width: `${width}%` }}
          />
        </div>
      </div>
      <ul className="mt-2 space-y-1 text-xs leading-5 text-steel">
        {risk.reasons.map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>
      <p className="mt-2.5 text-xs font-medium leading-5 text-road">{risk.recommendedAction}</p>
    </article>
  );
}
