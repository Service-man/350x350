// Canonical component taxonomy. "Engine" and "Cooling" are intentionally merged:
// the risk engine, health cards, and knowledge base all use "Engine/Cooling".
export const COMPONENT_OPTIONS = [
  "Battery",
  "Electrical",
  "Chain/Sprocket",
  "Clutch",
  "Brake Pads",
  "Tyres",
  "Engine/Cooling",
  "Suspension",
  "ECU/Sensors",
  "Fuel System",
  "Gearbox",
  "General Ownership"
] as const;

export type ComponentOption = (typeof COMPONENT_OPTIONS)[number];

export const HEALTH_COMPONENTS = [
  "Battery",
  "Chain/Sprocket",
  "Brake Pads",
  "Clutch",
  "Engine/Cooling",
  "Tyres"
] as const;
