import { CirclePlus } from "lucide-react";
import Link from "next/link";

type EmptyStateProps = {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

// Two actions render side by side so a rider can choose their starting
// point (e.g. "Add a bike" / "Log a service") without scrolling.
export function EmptyState({ title, description, actionHref, actionLabel, secondaryHref, secondaryLabel }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-stone-300 bg-white p-8 text-center">
      <CirclePlus className="mx-auto h-9 w-9 text-leaf" aria-hidden="true" />
      <h3 className="mt-3 text-lg font-semibold text-ink">{title}</h3>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm text-steel">{description}</p> : null}
      {actionHref && actionLabel ? (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Link className="btn-primary" href={actionHref}>
            {actionLabel}
          </Link>
          {secondaryHref && secondaryLabel ? (
            <Link className="btn-secondary" href={secondaryHref}>
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
