export type UsageType = "city" | "highway" | "touring" | "offroad" | "mixed";
export type ServiceType = "periodic" | "repair" | "inspection" | "emergency" | "modification";
export type GarageType = "authorized" | "independent" | "self";
export type Severity = "low" | "medium" | "high" | "critical";
export type Frequency = "once" | "intermittent" | "frequent" | "constant";

export type Bike = {
  id: string;
  user_id: string;
  brand: string;
  model: string;
  variant: string | null;
  manufacturing_year: number | null;
  purchase_year: number | null;
  odometer_km: number;
  city: string | null;
  usage_type: UsageType | null;
  has_modifications: boolean;
  modification_notes: string | null;
  fuel_type: string;
  created_at: string;
  updated_at: string;
};

export type ServiceLog = {
  id: string;
  user_id: string;
  bike_id: string;
  service_date: string;
  odometer_km: number;
  service_type: ServiceType;
  garage_type: GarageType | null;
  garage_name: string | null;
  city: string | null;
  total_cost: number | null;
  parts_replaced: string | null;
  labor_cost: number | null;
  notes: string | null;
  bill_file_url: string | null;
  created_at: string;
  updated_at: string;
};

export type SymptomLog = {
  id: string;
  user_id: string;
  bike_id: string;
  symptom_date: string;
  odometer_km: number | null;
  component: string;
  symptom_title: string;
  symptom_description: string | null;
  severity: Severity;
  frequency: Frequency | null;
  resolved: boolean;
  linked_service_log_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ConfidenceLevel = "low" | "medium" | "high";
export type KnownIssueSourceType = "seed" | "youtube" | "reddit" | "rss" | "oem" | "community";

// The inform-first knowledge base row (supersedes the legacy issue_clusters table).
export type KnownIssue = {
  id: string;
  brand: string;
  model: string;
  variant: string | null;
  mfg_year_start: number | null;
  mfg_year_end: number | null;
  component: string;
  issue_title: string;
  issue_summary: string | null;
  severity: Severity;
  mileage_band: string | null;
  service_checkpoint_km: number | null;
  rpm_band: string | null;
  symptoms_to_watch: string | null;
  preventive_action: string | null;
  typical_cost_min: number | null;
  typical_cost_max: number | null;
  mention_count: number;
  trend_percentage: number;
  confidence_level: ConfidenceLevel;
  source_type: KnownIssueSourceType;
  source_url: string | null;
  last_verified_at: string | null;
  created_at: string;
  updated_at: string;
};

// Shared result shape for server actions consumed via useActionState.
export type ActionState = {
  ok: boolean;
  error?: string;
  ts?: number;
};
