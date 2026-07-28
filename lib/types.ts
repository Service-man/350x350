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

export type BikeBodyType =
  | "Roadster"
  | "Cruiser"
  | "Adventure"
  | "Scrambler"
  | "Cafe Racer"
  | "Modern Classic"
  | "Sport"
  | "Bobber"
  | "Supermoto"
  | "Enduro"
  | "Tourer";

// A model in the premium (~300cc+) India catalogue. Distinct from a user's own
// `bikes` row — this is the reference list that powers the picker and library.
export type BikeCatalogEntry = {
  id: string;
  brand: string;
  model: string;
  engine_cc: number;
  body_type: BikeBodyType;
  year_start: number;
  year_end: number | null; // null = still on sale
  retail_band: string; // retail/service network, e.g. "Honda BigWing"
  popular: boolean;
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
  possible_solution: string | null;
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

// ── Editorial content (admin-authored) ──────────────────────────────────────
export type PublishStatus = "draft" | "published";

// A blog post. body_html is sanitized WYSIWYG output; rendered as-is.
export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body_html: string;
  cover_emoji: string | null;
  tags: string[];
  author_name: string | null;
  status: PublishStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DiyDifficulty = "easy" | "medium" | "advanced";

// One ordered step in a DIY guide.
export type DiyStep = { title: string; detail: string };

// An affiliate product link attached to a DIY guide. amazon_url is entered and
// controlled entirely from the admin panel (the site never scrapes Amazon).
export type DiyProduct = {
  id: string;
  guide_id: string;
  title: string;
  description: string | null;
  amazon_url: string;
  approx_price: string | null;
  position: number;
  created_at: string;
  updated_at: string;
};

// A curated DIY fix. Optionally tagged to a brand/model/component so it can be
// surfaced next to the relevant known issues, but kept in its own collection so
// affiliate links never enter the neutral knowledge base.
export type DiyGuide = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  brand: string | null;
  model: string | null;
  component: string | null;
  difficulty: DiyDifficulty;
  estimated_time: string | null;
  steps: DiyStep[];
  status: PublishStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  products: DiyProduct[];
};
