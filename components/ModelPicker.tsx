"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BIKE_MODELS } from "@/lib/constants/bikes";
import { modelPath } from "@/lib/knowledge/slugs";

const YEARS = Array.from({ length: 12 }, (_, index) => 2026 - index);

// The inform-first front door: pick a model, land on its public issue page.
// No account, no data entry. Styled for the landing page's dark hero card.
export function ModelPicker() {
  const router = useRouter();
  const brands = useMemo(() => Array.from(new Set(BIKE_MODELS.map((entry) => entry.brand))), []);
  const [brand, setBrand] = useState<string>(brands[0]);
  const models = useMemo(() => BIKE_MODELS.filter((entry) => entry.brand === brand), [brand]);
  const [model, setModel] = useState<string>(models[0]?.model ?? "");
  const [year, setYear] = useState<string>("");

  function onBrandChange(nextBrand: string) {
    setBrand(nextBrand);
    const first = BIKE_MODELS.find((entry) => entry.brand === nextBrand);
    setModel(first?.model ?? "");
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!model) return;
    const base = modelPath(brand, model);
    router.push(year ? `${base}?year=${year}` : base);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="block">
        <span className="label-dark mb-1.5">Brand</span>
        <select className="field-dark" value={brand} onChange={(event) => onBrandChange(event.target.value)}>
          {brands.map((entry) => (
            <option key={entry} value={entry}>
              {entry}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="label-dark mb-1.5">Model</span>
        <select className="field-dark" value={model} onChange={(event) => setModel(event.target.value)}>
          {models.map((entry) => (
            <option key={entry.model} value={entry.model}>
              {entry.model}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="label-dark mb-1.5">Year · optional</span>
        <select className="field-dark" value={year} onChange={(event) => setYear(event.target.value)}>
          <option value="">Not sure</option>
          {YEARS.map((entry) => (
            <option key={entry} value={entry}>
              {entry}
            </option>
          ))}
        </select>
      </label>
      <button className="btn-primary w-full" type="submit">
        Show known issues
      </button>
    </form>
  );
}
