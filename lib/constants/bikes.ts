import { BIKE_CATALOG } from "@/lib/catalog/bikeCatalog";

// Derived from the full catalogue so the picker, ingestion, and any consumer
// stay in sync with lib/catalog/bikeCatalog.ts (the single source of truth).
export const BIKE_MODELS = BIKE_CATALOG.map(({ brand, model }) => ({ brand, model }));

export const USAGE_TYPES = ["city", "highway", "touring", "offroad", "mixed"] as const;
export const SERVICE_TYPES = ["periodic", "repair", "inspection", "emergency", "modification"] as const;
export const GARAGE_TYPES = ["authorized", "independent", "self"] as const;
export const SEVERITIES = ["low", "medium", "high", "critical"] as const;
export const FREQUENCIES = ["once", "intermittent", "frequent", "constant"] as const;

// "Most common route" — the friendlier, rider-worded labels for usage_type.
// DB values stay the same so the risk engine and existing rows are unaffected.
export const USAGE_TYPE_LABELS: Record<(typeof USAGE_TYPES)[number], string> = {
  city: "Office commute & daily needs",
  offroad: "Village & jungle road rides",
  highway: "Intercity commute",
  touring: "Travelling to off-beat places",
  mixed: "Mixed — a bit of everything"
};

// Riding-pattern options the service log form and the kundli chat both use.
export const SERVICE_NUMBERS = [
  ["1", "1st service"],
  ["2", "2nd service"],
  ["3", "3rd service"],
  ["4", "4th service"],
  ["5", "5th service"],
  ["post5", "Post 5th service"]
] as const;

export const CRUISING_SPEEDS = [
  ["40-60", "40–60 km/h"],
  ["60-80", "60–80 km/h"],
  ["80-100", "80–100 km/h"],
  ["100+", "100+ km/h"]
] as const;

export const RIDE_FREQUENCIES = [
  ["daily", "Daily"],
  ["weekdays", "Weekdays only"],
  ["weekends", "Weekends only"],
  ["occasional", "Occasionally"]
] as const;

export const PILLION_OPTIONS = [
  ["rarely", "Rarely — mostly solo"],
  ["sometimes", "Sometimes"],
  ["often", "Often — pillion or luggage"]
] as const;
