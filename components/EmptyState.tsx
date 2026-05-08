import { CirclePlus } from "lucide-react";
import Link from "next/link";

type EmptyStateProps = {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
};

export function EmptyState({ title, description, actionHref, actionLabel }: EmptyStateProps) {
  return (
    <div className="rounded border border-dashed border-stone-300 bg-white p-8 text-center">
      <CirclePlus className="mx-auto h-9 w-9 text-leaf" aria-hidden="true" />
      <h3 className="mt-3 text-lg font-semibold text-ink">{title}</h3>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm text-steel">{description}</p> : null}
      {actionHref && actionLabel ? (
        <Link className="btn-primary mt-5" href={actionHref}>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
