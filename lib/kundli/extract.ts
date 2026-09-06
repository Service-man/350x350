import { extractText, getDocumentProxy } from "unpdf";
import { EXTRACT_SYSTEM } from "./prompts";
import { getLlmProvider, llmChat, parseJsonObject } from "./llm";
import type { ServiceLogDraft, ServiceNumber } from "@/lib/types";

// Reads a service bill (image or PDF) into a ServiceLogDraft.
//   PDF   → text via unpdf → LLM JSON (if configured) → regex fallback
//   image → LLM vision JSON (if configured) → nothing readable without AI
// Every path degrades gracefully; the caller always gets a draft plus a
// `via` tag so the chat can say honestly how much it could read.

export type ExtractionResult = {
  draft: ServiceLogDraft;
  via: "llm" | "rules" | "none";
  text?: string;
};

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // Vercel route-handler body ceiling is ~4.5 MB
export const ACCEPTED_MIMES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export function isAcceptedUpload(mime: string, name: string) {
  if (ACCEPTED_MIMES.includes(mime)) return true;
  return /\.(png|jpe?g|webp|pdf)$/i.test(name);
}

export async function extractServiceLogFromFile(file: { name: string; mime: string; bytes: Buffer }): Promise<ExtractionResult> {
  const isPdf = file.mime === "application/pdf" || /\.pdf$/i.test(file.name);

  if (isPdf) {
    const text = await pdfToText(file.bytes);
    if (text.trim().length === 0) return { draft: {}, via: "none", text: "" };
    if (getLlmProvider() !== "rules") {
      const raw = await llmChat({
        system: EXTRACT_SYSTEM,
        turns: [{ role: "user", content: `Bill text:\n\n${text.slice(0, 12_000)}` }],
        json: true,
        maxTokens: 500
      });
      const parsed = normaliseDraft(parseJsonObject<Record<string, unknown>>(raw));
      if (parsed) return { draft: parsed, via: "llm", text };
    }
    return { draft: parseBillText(text), via: "rules", text };
  }

  // Image
  if (getLlmProvider() !== "rules") {
    const raw = await llmChat({
      system: EXTRACT_SYSTEM,
      turns: [{ role: "user", content: "Read this service bill and return the JSON." }],
      images: [{ mime: normaliseImageMime(file.mime, file.name), base64: file.bytes.toString("base64") }],
      json: true,
      maxTokens: 500
    });
    const parsed = normaliseDraft(parseJsonObject<Record<string, unknown>>(raw));
    if (parsed) return { draft: parsed, via: "llm" };
  }
  return { draft: {}, via: "none" };
}

async function pdfToText(bytes: Buffer): Promise<string> {
  try {
    const pdf = await getDocumentProxy(new Uint8Array(bytes));
    const { text } = await extractText(pdf, { mergePages: true });
    return typeof text === "string" ? text : (text as string[]).join("\n");
  } catch (error) {
    console.error("[kundli] pdf text extraction failed:", error instanceof Error ? error.message : error);
    return "";
  }
}

function normaliseImageMime(mime: string, name: string) {
  if (mime.startsWith("image/")) return mime;
  if (/\.png$/i.test(name)) return "image/png";
  if (/\.webp$/i.test(name)) return "image/webp";
  return "image/jpeg";
}

// ── Rules-based parsing (no AI needed) ───────────────────────────────────────

const PART_TERMS = [
  "engine oil", "oil filter", "air filter", "spark plug", "brake pad", "brake pads", "brake shoe", "brake fluid",
  "chain", "sprocket", "chain sprocket kit", "clutch plate", "clutch cable", "clutch", "coolant", "battery",
  "bulb", "headlight", "tail lamp", "indicator", "relay", "fuse", "tyre", "tire", "tube", "wheel bearing",
  "fork oil", "fork seal", "shock absorber", "disc", "rotor", "gasket", "o-ring", "throttle cable", "speedo cable",
  "grease", "chain lube", "wash", "polish"
];

const MONTHS: Record<string, string> = {
  jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
  jul: "07", aug: "08", sep: "09", sept: "09", oct: "10", nov: "11", dec: "12"
};

function pad(n: string) {
  return n.padStart(2, "0");
}

function findDate(text: string): string | null {
  // dd/mm/yyyy or dd-mm-yyyy
  let m = text.match(/\b(\d{1,2})[\/-](\d{1,2})[\/-](20\d{2})\b/);
  if (m) return `${m[3]}-${pad(m[2])}-${pad(m[1])}`;
  // yyyy-mm-dd
  m = text.match(/\b(20\d{2})-(\d{1,2})-(\d{1,2})\b/);
  if (m) return `${m[1]}-${pad(m[2])}-${pad(m[3])}`;
  // 12 Jul 2026 / 12th July, 2026
  m = text.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]{3,9})[,.]?\s+(20\d{2})\b/);
  if (m) {
    const month = MONTHS[m[2].slice(0, 3).toLowerCase()];
    if (month) return `${m[3]}-${month}-${pad(m[1])}`;
  }
  return null;
}

function findNumberAfter(text: string, labels: RegExp): number | null {
  const m = text.match(labels);
  if (!m) return null;
  const digits = m[1].replace(/[,\s]/g, "");
  const value = Number(digits);
  return Number.isFinite(value) && value > 0 ? Math.round(value) : null;
}

function findServiceNumber(text: string): ServiceNumber | null {
  const t = text.toLowerCase();
  if (/\b(1st|first)\s+(free\s+)?service/.test(t) || /\bfree\s+service\s*(no\.?|#)?\s*1\b/.test(t)) return "1";
  if (/\b(2nd|second)\s+(free\s+)?service/.test(t)) return "2";
  if (/\b(3rd|third)\s+(free\s+)?service/.test(t)) return "3";
  if (/\b(4th|fourth)\s+service/.test(t)) return "4";
  if (/\b(5th|fifth)\s+service/.test(t)) return "5";
  if (/\bpaid\s+service|\b(6th|7th|8th|sixth|seventh)\s+service/.test(t)) return "post5";
  return null;
}

export function parseBillText(text: string): ServiceLogDraft {
  const t = text.replace(/\r/g, "");
  const lower = t.toLowerCase();
  const draft: ServiceLogDraft = {};

  draft.service_date = findDate(t);
  draft.odometer_km =
    findNumberAfter(t, /(?:odo(?:meter)?|km\s*reading|kms?\s*run|kilomet(?:er|re)s?)\D{0,20}?(\d[\d,]{2,7})/i) ??
    findNumberAfter(t, /(\d[\d,]{3,7})\s*kms?\b/i);
  // The final payable line first (grand total / net payable), so a "Sub total"
  // earlier on the bill can't win; a bare "total" is the fallback.
  draft.total_cost =
    findNumberAfter(t, /(?:grand\s+total|net\s+(?:amount|payable)|amount\s+payable|total\s+payable|total\s+amount)\D{0,25}?(?:₹|rs\.?|inr)?\s*(\d[\d,]*(?:\.\d{1,2})?)/i) ??
    findNumberAfter(t, /(?<!sub\s?)(?<!sub-)\btotal\b\D{0,25}?(?:₹|rs\.?|inr)?\s*(\d[\d,]*(?:\.\d{1,2})?)/i);
  draft.labor_cost = findNumberAfter(t, /(?:labou?r|service\s+charge|workmanship)\D{0,25}?(?:₹|rs\.?|inr)?\s*(\d[\d,]*(?:\.\d{1,2})?)/i);

  const parts = PART_TERMS.filter((term) => lower.includes(term));
  // Collapse "brake pad"/"brake pads" style duplicates and generic "chain" when the kit matched.
  const deduped = parts.filter((p) => !parts.some((q) => q !== p && q.includes(p)));
  draft.parts_replaced = deduped.length ? deduped.map(titleWord).join(", ") : null;

  draft.service_number = findServiceNumber(t);

  if (/repair|replace(?:d|ment)?\b|breakdown/.test(lower) && !/periodic|free service|scheduled/.test(lower)) {
    draft.service_type = "repair";
  } else if (/periodic|scheduled|free service|paid service|general service/.test(lower)) {
    draft.service_type = "periodic";
  }

  const dealer = /(royal enfield|honda bigwing|ktm|bajaj|tvs|yamaha|triumph|jawa|kawasaki|hero|harley|husqvarna|bmw motorrad|aprilia|benelli)/i.exec(t);
  if (dealer) {
    draft.garage_type = "authorized";
    draft.brand = titleWord(dealer[1]);
  }

  const cityMatch = /\b(bengaluru|bangalore|pune|mumbai|delhi|new delhi|gurugram|gurgaon|noida|hyderabad|chennai|kolkata|ahmedabad|jaipur|lucknow|chandigarh|kochi|coimbatore|indore|bhopal|nagpur|surat|vadodara|dehradun|guwahati|goa)\b/i.exec(t);
  if (cityMatch) draft.city = titleWord(cityMatch[1]);

  const modelMatch = /\b(classic 350|bullet 350|hunter 350|meteor 350|himalayan(?: 450)?|interceptor 650|continental gt 650|super meteor 650|shotgun 650|guerrilla 450|390 duke|250 duke|390 adventure|rc 390|dominar 400|pulsar (?:ns|rs) ?200|pulsar n250|apache rr ?310|apache rtr ?310|r15|mt-15|fz ?25|cb350|cb300r|cb500x|speed 400|scrambler 400x|jawa 42|perak|yezdi (?:adventure|roadster|scrambler)|kawasaki (?:z650|ninja 300|ninja 400|versys 650)|x440|harley[- ]davidson x440|gixxer 250|v-strom 250)\b/i.exec(t);
  if (modelMatch) draft.model = titleWord(modelMatch[1]);

  const yearMatch = /\b(20[12]\d)\b(?![\/-])/.exec(t.replace(draft.service_date ?? "", ""));
  if (yearMatch && !draft.service_date?.startsWith(yearMatch[1])) draft.year = Number(yearMatch[1]);

  return draft;
}

function titleWord(value: string) {
  return value.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

// Bring whatever the model returned into the strict draft shape.
function normaliseDraft(raw: Record<string, unknown> | null): ServiceLogDraft | null {
  if (!raw || typeof raw !== "object") return null;
  const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? Math.round(v) : typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v.replace(/[,₹\s]/g, ""))) ? Math.round(Number(v.replace(/[,₹\s]/g, ""))) : null);
  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
  const oneOf = <T extends string>(v: unknown, allowed: readonly T[]): T | null =>
    typeof v === "string" && (allowed as readonly string[]).includes(v) ? (v as T) : null;
  const draft: ServiceLogDraft = {
    service_date: str(raw.service_date),
    odometer_km: num(raw.odometer_km),
    service_type: oneOf(raw.service_type, ["periodic", "repair", "inspection", "emergency", "modification"] as const),
    garage_type: oneOf(raw.garage_type, ["authorized", "independent", "self"] as const),
    garage_name: str(raw.garage_name),
    city: str(raw.city),
    total_cost: num(raw.total_cost),
    labor_cost: num(raw.labor_cost),
    parts_replaced: Array.isArray(raw.parts_replaced) ? raw.parts_replaced.map(String).join(", ") : str(raw.parts_replaced),
    service_number: oneOf(raw.service_number, ["1", "2", "3", "4", "5", "post5"] as const),
    brand: str(raw.brand),
    model: str(raw.model),
    year: num(raw.year)
  };
  const anyValue = Object.values(draft).some((v) => v !== null && v !== undefined);
  return anyValue ? draft : null;
}

// The fields a service log needs before it can be saved, in the order the
// chat should ask for them.
export function draftMissing(draft: ServiceLogDraft): Array<"service_date" | "odometer_km" | "service_number"> {
  const missing: Array<"service_date" | "odometer_km" | "service_number"> = [];
  if (!draft.service_date) missing.push("service_date");
  if (!draft.odometer_km) missing.push("odometer_km");
  if (!draft.service_number) missing.push("service_number");
  return missing;
}
