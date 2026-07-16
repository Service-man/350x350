import { BIKE_CATALOG } from "@/lib/catalog/bikeCatalog";

// Derived from the full catalogue so the picker, ingestion, and any consumer
// stay in sync with lib/catalog/bikeCatalog.ts (the single source of truth).
export const BIKE_MODELS = BIKE_CATALOG.map(({ brand, model }) => ({ brand, model }));

export const USAGE_TYPES = ["city", "highway", "touring", "offroad", "mixed"] as const;
export const SERVICE_TYPES = ["periodic", "repair", "inspection", "emergency", "modification"] as const;
export const GARAGE_TYPES = ["authorized", "independent", "self"] as const;
export const SEVERITIES = ["low", "medium", "high", "critical"] as const;
export const FREQUENCIES = ["once", "intermittent", "frequent", "constant"] as const;
