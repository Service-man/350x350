import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatInr(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return "Not logged";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatKm(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return "0 km";
  return `${new Intl.NumberFormat("en-IN").format(value)} km`;
}

export function titleCase(value: string | null | undefined) {
  if (!value) return "Not set";
  return value
    .split(/[\s_-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function parseNumber(value: FormDataEntryValue | null) {
  if (!value || String(value).trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
