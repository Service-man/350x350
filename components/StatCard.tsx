import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string | number;
  helper?: string;
  icon: LucideIcon;
};

export function StatCard({ label, value, helper, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded border border-stone-200 bg-white p-4 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <span className="label">{label}</span>
        <Icon className="h-5 w-5 text-leaf" aria-hidden="true" />
      </div>
      <p className="mt-3 text-2xl font-semibold text-ink">{value}</p>
      {helper ? <p className="mt-1 text-sm text-steel">{helper}</p> : null}
    </div>
  );
}
