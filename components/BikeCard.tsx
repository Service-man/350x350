import { CalendarDays, Gauge, MapPin, Wrench } from "lucide-react";
import type { Bike, ServiceLog } from "@/lib/types";
import { formatKm, titleCase } from "@/lib/utils";

export function BikeCard({ bike, lastService }: { bike: Bike; lastService?: ServiceLog }) {
  return (
    <article className="rounded border border-stone-200 bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-leaf">{bike.brand}</p>
          <h3 className="mt-1 text-xl font-semibold text-ink">{bike.model}</h3>
          <p className="mt-1 text-sm text-steel">{bike.variant || "Standard variant"}</p>
        </div>
        <span className="rounded bg-mint px-2 py-1 text-xs font-semibold text-leaf">
          {bike.manufacturing_year || "Year NA"}
        </span>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-steel">
          <Gauge className="h-4 w-4 text-leaf" aria-hidden="true" />
          <span>{formatKm(bike.odometer_km)}</span>
        </div>
        <div className="flex items-center gap-2 text-steel">
          <MapPin className="h-4 w-4 text-leaf" aria-hidden="true" />
          <span>{bike.city || "City not set"}</span>
        </div>
        <div className="flex items-center gap-2 text-steel">
          <Wrench className="h-4 w-4 text-leaf" aria-hidden="true" />
          <span>{titleCase(bike.usage_type)}</span>
        </div>
        <div className="flex items-center gap-2 text-steel">
          <CalendarDays className="h-4 w-4 text-leaf" aria-hidden="true" />
          <span>{lastService?.service_date || "No service yet"}</span>
        </div>
      </dl>
    </article>
  );
}
