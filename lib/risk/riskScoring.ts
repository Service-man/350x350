import type { Bike, ServiceLog, SymptomLog } from "@/lib/types";

export type RiskLevel = "Low" | "Medium" | "High";

export type ComponentRiskScore = {
  component: string;
  score: number;
  level: RiskLevel;
  reasons: string[];
  recommendedAction: string;
};

type RiskConfig = {
  low: string;
  medium: string;
  high: string;
};

const actions: Record<string, RiskConfig> = {
  Battery: {
    low: "Review at next service.",
    medium: "Check voltage trend and accessory wiring.",
    high: "Inspect battery, relay, grounding, and accessory wiring soon."
  },
  "Chain/Sprocket": {
    low: "Continue regular lubrication.",
    medium: "Inspect chain slack and lubrication history.",
    high: "Inspect chain/sprocket wear before long rides."
  },
  "Brake Pads": {
    low: "Review at next service.",
    medium: "Inspect pads and brake noise.",
    high: "Avoid aggressive riding until brake inspection."
  },
  Clutch: {
    low: "Monitor clutch feel.",
    medium: "Track bite point and lever hardness.",
    high: "Inspect clutch cable/plates soon."
  },
  "Engine/Cooling": {
    low: "Monitor temperature behavior.",
    medium: "Check fan cycles, oil level, and traffic heating.",
    high: "Inspect cooling/engine symptoms before long rides."
  },
  Tyres: {
    low: "Check tyre pressure weekly.",
    medium: "Inspect tread and puncture history.",
    high: "Inspect tyres before highway/touring rides."
  }
};

function levelFor(score: number): RiskLevel {
  if (score >= 70) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

function actionFor(component: string, level: RiskLevel) {
  const config = actions[component];
  return config[level.toLowerCase() as keyof RiskConfig];
}

function hasSeverity(symptoms: SymptomLog[]) {
  return symptoms.some((symptom) => ["high", "critical"].includes(symptom.severity));
}

function hasFrequency(symptoms: SymptomLog[]) {
  return symptoms.some((symptom) => ["frequent", "constant"].includes(symptom.frequency ?? ""));
}

function matchingSymptoms(symptoms: SymptomLog[], terms: string[]) {
  const loweredTerms = terms.map((term) => term.toLowerCase());
  return symptoms.filter((symptom) => {
    const haystack = [
      symptom.component,
      symptom.symptom_title,
      symptom.symptom_description ?? ""
    ]
      .join(" ")
      .toLowerCase();
    return loweredTerms.some((term) => haystack.includes(term));
  });
}

function noServiceInLastKm(bike: Bike, serviceLogs: ServiceLog[], km: number) {
  if (serviceLogs.length === 0) return true;
  const latest = Math.max(...serviceLogs.map((log) => log.odometer_km));
  return bike.odometer_km - latest > km;
}

function recentRepairMention(serviceLogs: ServiceLog[]) {
  const sorted = [...serviceLogs].sort((a, b) => b.service_date.localeCompare(a.service_date));
  const latest = sorted[0];
  if (!latest) return false;
  const haystack = [latest.service_type, latest.notes ?? "", latest.parts_replaced ?? ""].join(" ").toLowerCase();
  return haystack.includes("repair") || haystack.includes("engine") || haystack.includes("cooling");
}

function buildScore(component: string, score: number, reasons: string[]): ComponentRiskScore {
  const capped = Math.min(100, score);
  const level = levelFor(capped);
  return {
    component,
    score: capped,
    level,
    reasons: reasons.length > 0 ? reasons : ["No strong warning signals in current logs."],
    recommendedAction: actionFor(component, level)
  };
}

export function calculateRiskScores(
  bike: Bike,
  symptomLogs: SymptomLog[],
  serviceLogs: ServiceLog[]
): ComponentRiskScore[] {
  const activeSymptoms = symptomLogs.filter((symptom) => symptom.bike_id === bike.id && !symptom.resolved);
  const bikeServices = serviceLogs.filter((log) => log.bike_id === bike.id);
  const results: ComponentRiskScore[] = [];

  const electrical = matchingSymptoms(activeSymptoms, ["battery", "electrical", "warning", "relay", "voltage"]);
  let score = 0;
  const batteryReasons: string[] = [];
  if (electrical.length) {
    score += 20;
    batteryReasons.push("electrical or battery symptoms are open");
  }
  if (bike.has_modifications) {
    score += 15;
    batteryReasons.push("accessories or modifications are logged");
  }
  if (bike.odometer_km > 7000) {
    score += 10;
    batteryReasons.push("odometer is above 7,000 km");
  }
  if (hasSeverity(electrical)) {
    score += 10;
    batteryReasons.push("a related symptom is high or critical severity");
  }
  results.push(buildScore("Battery", score, batteryReasons));

  const chain = matchingSymptoms(activeSymptoms, ["chain", "sprocket"]);
  score = 0;
  const chainReasons: string[] = [];
  if (chain.length) {
    score += 20;
    chainReasons.push("chain or sprocket symptoms are open");
  }
  if (bike.odometer_km > 8000) {
    score += 15;
    chainReasons.push("odometer is above 8,000 km");
  }
  if (["touring", "offroad", "mixed"].includes(bike.usage_type ?? "")) {
    score += 10;
    chainReasons.push("usage pattern adds chain load");
  }
  if (noServiceInLastKm(bike, bikeServices, 2000)) {
    score += 10;
    chainReasons.push("no service log is present in the last 2,000 km");
  }
  results.push(buildScore("Chain/Sprocket", score, chainReasons));

  const brakes = matchingSymptoms(activeSymptoms, ["brake", "pads"]);
  score = 0;
  const brakeReasons: string[] = [];
  if (brakes.length) {
    score += 20;
    brakeReasons.push("brake symptoms are open");
  }
  if (bike.odometer_km > 10000) {
    score += 15;
    brakeReasons.push("odometer is above 10,000 km");
  }
  if (bike.usage_type === "city") {
    score += 10;
    brakeReasons.push("city usage can increase brake wear");
  }
  if (hasSeverity(brakes)) {
    score += 10;
    brakeReasons.push("a brake symptom is high or critical severity");
  }
  results.push(buildScore("Brake Pads", score, brakeReasons));

  const clutch = matchingSymptoms(activeSymptoms, ["clutch"]);
  score = 0;
  const clutchReasons: string[] = [];
  if (clutch.length) {
    score += 20;
    clutchReasons.push("clutch symptoms are open");
  }
  if (bike.odometer_km > 12000) {
    score += 15;
    clutchReasons.push("odometer is above 12,000 km");
  }
  if (bike.usage_type === "city") {
    score += 10;
    clutchReasons.push("city riding can increase clutch use");
  }
  if (hasFrequency(clutch)) {
    score += 10;
    clutchReasons.push("a clutch symptom is frequent or constant");
  }
  results.push(buildScore("Clutch", score, clutchReasons));

  const engine = matchingSymptoms(activeSymptoms, ["engine", "cooling", "heat", "heating", "fan", "temperature"]);
  score = 0;
  const engineReasons: string[] = [];
  if (engine.length) {
    score += 25;
    engineReasons.push("engine, heating, or cooling symptoms are open");
  }
  if (hasSeverity(engine)) {
    score += 15;
    engineReasons.push("a related symptom is high or critical severity");
  }
  if (engine.length > 1) {
    score += 10;
    engineReasons.push("repeated related symptoms are logged");
  }
  if (recentRepairMention(bikeServices)) {
    score += 10;
    engineReasons.push("recent service history mentions repair or engine/cooling work");
  }
  results.push(buildScore("Engine/Cooling", score, engineReasons));

  const tyres = matchingSymptoms(activeSymptoms, ["tyre", "tire", "puncture", "tread"]);
  score = 0;
  const tyreReasons: string[] = [];
  if (tyres.length) {
    score += 20;
    tyreReasons.push("tyre symptoms are open");
  }
  if (bike.odometer_km > 15000) {
    score += 15;
    tyreReasons.push("odometer is above 15,000 km");
  }
  if (["touring", "offroad"].includes(bike.usage_type ?? "")) {
    score += 10;
    tyreReasons.push("touring or offroad usage adds tyre wear");
  }
  results.push(buildScore("Tyres", score, tyreReasons));

  return results;
}
