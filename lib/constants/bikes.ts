export const BIKE_MODELS = [
  { brand: "Royal Enfield", model: "Classic 350" },
  { brand: "Royal Enfield", model: "Meteor 350" },
  { brand: "Royal Enfield", model: "Hunter 350" },
  { brand: "Royal Enfield", model: "Himalayan 450" },
  { brand: "Honda", model: "CB350" },
  { brand: "KTM", model: "Duke 390" },
  { brand: "Triumph", model: "Speed 400" }
] as const;

export const USAGE_TYPES = ["city", "highway", "touring", "offroad", "mixed"] as const;
export const SERVICE_TYPES = ["periodic", "repair", "inspection", "emergency", "modification"] as const;
export const GARAGE_TYPES = ["authorized", "independent", "self"] as const;
export const SEVERITIES = ["low", "medium", "high", "critical"] as const;
export const FREQUENCIES = ["once", "intermittent", "frequent", "constant"] as const;
