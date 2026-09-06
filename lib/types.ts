export type UsageType = "city" | "highway" | "touring" | "offroad" | "mixed";
export type ServiceType = "periodic" | "repair" | "inspection" | "emergency" | "modification";
export type GarageType = "authorized" | "independent" | "self";
export type Severity = "low" | "medium" | "high" | "critical";
export type Frequency = "once" | "intermittent" | "frequent" | "constant";

// ── Riding pattern ───────────────────────────────────────────────────────────
// Lives on the bike: it describes how this rider uses this machine, which is
// what the kundli uses to weight which parts wear first. usage_type (the most
// common route) is the bike's existing column; the rest sit in riding_profile.
export type CruisingSpeed = "40-60" | "60-80" | "80-100" | "100+";
export type RideFrequency = "daily" | "weekdays" | "weekends" | "occasional";
export type PillionFrequency = "rarely" | "sometimes" | "often";

export type RidingProfile = {
  cruising_speed?: CruisingSpeed | null;
  daily_distance_km?: number | null;
  ride_frequency?: RideFrequency | null;
  daily_ride_minutes?: number | null;
  pillion?: PillionFrequency | null;
  notes?: string | null;
};

export type ServiceNumber = "1" | "2" | "3" | "4" | "5" | "post5";

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
  riding_profile: RidingProfile;
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
  service_number: ServiceNumber | null;
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
  predicted_issue: string | null;
  created_at: string;
  updated_at: string;
};

// ── Kundli chat ──────────────────────────────────────────────────────────────
// A service-log draft: what was read off an uploaded bill (or typed in chat),
// used to pre-fill the manual form. Every field is optional by nature.
export type ServiceLogDraft = {
  bike_id?: string | null;
  brand?: string | null;
  model?: string | null;
  year?: number | null;
  service_date?: string | null;
  odometer_km?: number | null;
  service_type?: ServiceType | null;
  garage_type?: GarageType | null;
  garage_name?: string | null;
  city?: string | null;
  total_cost?: number | null;
  labor_cost?: number | null;
  parts_replaced?: string | null;
  service_number?: ServiceNumber | null;
  notes?: string | null;
};

// Which field an assistant turn asked for, so a chip/typed answer can be
// applied to the right place on the next turn.
export type KundliAskField =
  | "cruising_speed"
  | "ride_frequency"
  | "daily_distance_km"
  | "daily_ride_minutes"
  | "pillion"
  | "service_number"
  | "odometer_km"
  | "service_date"
  | "parts_reason";

export type KundliMeta = {
  draft?: ServiceLogDraft | null;
  ask?: KundliAskField | null;
  chips?: string[];
  provider?: "openai" | "anthropic" | "rules";
};

export type KundliChat = {
  id: string;
  user_id: string;
  bike_id: string | null;
  title: string | null;
  created_at: string;
  updated_at: string;
};

export type KundliMessage = {
  id: string;
  chat_id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  attachment_name: string | null;
  meta: KundliMeta | null;
  created_at: string;
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
// `message` carries a success detail worth showing (e.g. the deduced problem).
export type ActionState = {
  ok: boolean;
  error?: string;
  message?: string;
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
