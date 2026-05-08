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

export type IssueCluster = {
  id: string;
  bike_brand: string;
  bike_model: string;
  component: string;
  issue_title: string;
  issue_summary: string | null;
  severity: Severity;
  mileage_band: string | null;
  mention_count: number;
  trend_percentage: number;
  confidence_level: string;
  source_type: string;
  created_at: string;
  updated_at: string;
};
