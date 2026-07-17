import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string | number;
  helper?: string;
  /** Accepted for compatibility; the redesign's stat cards are icon-free. */
  icon?: LucideIcon;
  /** "dark" renders the inverted ink card used for the highlight stat. */
  variant?: "light" | "dark";
};

export function StatCard({ label, value, helper, variant = "light" }: StatCardProps) {
  const dark = variant === "dark";
  return (
    <div
      className={cn(
        "rounded-xl p-[18px]",
        dark ? "bg-ink text-white" : "border border-stone-200 bg-white shadow-soft"
      )}
    >
      <p
        className={cn(
          "mb-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em]",
          dark ? "text-lavmute" : "text-leaf"
        )}
      >
        {label}
      </p>
      <p className={cn("text-3xl font-black", dark ? "text-white" : "text-ink")}>{value}</p>
      {helper ? (
        <p className={cn("mt-0.5 text-xs", dark ? "text-lavmute" : "text-steel")}>{helper}</p>
      ) : null}
    </div>
  );
}
