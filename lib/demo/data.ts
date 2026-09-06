import type { Bike, ServiceLog, SymptomLog } from "@/lib/types";

const demoUserId = "00000000-0000-4000-8000-000000000350";
const now = new Date().toISOString();

export const demoProfile = {
  id: demoUserId,
  full_name: "Demo Rider",
  city: "Bengaluru"
};

export const demoBikes: Bike[] = [
  {
    id: "10000000-0000-4000-8000-000000000350",
    user_id: demoUserId,
    brand: "Royal Enfield",
    model: "Classic 350",
    variant: "Signals",
    manufacturing_year: 2023,
    purchase_year: 2023,
    odometer_km: 12650,
    city: "Bengaluru",
    usage_type: "mixed",
    has_modifications: true,
    modification_notes: "Aux lights and phone charger",
    fuel_type: "petrol",
    riding_profile: { cruising_speed: "60-80", ride_frequency: "daily", daily_distance_km: 24, daily_ride_minutes: 60, pillion: "sometimes" },
    created_at: now,
    updated_at: now
  },
  {
    id: "20000000-0000-4000-8000-000000000350",
    user_id: demoUserId,
    brand: "Honda",
    model: "CB350",
    variant: "DLX Pro",
    manufacturing_year: 2022,
    purchase_year: 2022,
    odometer_km: 18400,
    city: "Pune",
    usage_type: "city",
    has_modifications: false,
    modification_notes: null,
    fuel_type: "petrol",
    riding_profile: {},
    created_at: now,
    updated_at: now
  }
];

export const demoServiceLogs: ServiceLog[] = [
  {
    id: "30000000-0000-4000-8000-000000000350",
    user_id: demoUserId,
    bike_id: demoBikes[0].id,
    service_date: "2026-04-20",
    odometer_km: 11850,
    service_type: "repair",
    garage_type: "independent",
    garage_name: "Indiranagar Moto Works",
    city: "Bengaluru",
    total_cost: 4200,
    parts_replaced: "Engine oil, chain clean/lube, relay check",
    labor_cost: 900,
    notes: "Checked accessory wiring after weak start complaint.",
    bill_file_url: null,
    service_number: "3",
    created_at: now,
    updated_at: now
  },
  {
    id: "40000000-0000-4000-8000-000000000350",
    user_id: demoUserId,
    bike_id: demoBikes[1].id,
    service_date: "2026-03-18",
    odometer_km: 17100,
    service_type: "periodic",
    garage_type: "authorized",
    garage_name: "Honda BigWing Pune",
    city: "Pune",
    total_cost: 3100,
    parts_replaced: "Oil filter, chain adjustment",
    labor_cost: 750,
    notes: "Periodic service with chain slack adjustment.",
    bill_file_url: null,
    service_number: "2",
    created_at: now,
    updated_at: now
  }
];

export const demoSymptoms: SymptomLog[] = [
  {
    id: "50000000-0000-4000-8000-000000000350",
    user_id: demoUserId,
    bike_id: demoBikes[0].id,
    symptom_date: "2026-04-29",
    odometer_km: 12400,
    component: "Electrical",
    symptom_title: "Weak start after night parking",
    symptom_description: "Starter feels slow when aux lights were used the previous evening.",
    severity: "medium",
    frequency: "intermittent",
    resolved: false,
    linked_service_log_id: demoServiceLogs[0].id,
    predicted_issue: "Weak cranking after accessory drain",
    created_at: now,
    updated_at: now
  },
  {
    id: "60000000-0000-4000-8000-000000000350",
    user_id: demoUserId,
    bike_id: demoBikes[0].id,
    symptom_date: "2026-04-30",
    odometer_km: 12600,
    component: "Chain/Sprocket",
    symptom_title: "Chain noise in stop-go traffic",
    symptom_description: "Noticeable chain slap at low speeds.",
    severity: "low",
    frequency: "frequent",
    resolved: false,
    linked_service_log_id: null,
    predicted_issue: null,
    created_at: now,
    updated_at: now
  }
];
