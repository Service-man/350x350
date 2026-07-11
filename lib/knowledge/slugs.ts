import { BIKE_MODELS } from "@/lib/constants/bikes";

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[\s/]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

export type ModelRoute = {
  brand: string;
  model: string;
  brandSlug: string;
  modelSlug: string;
};

export const MODEL_ROUTES: ModelRoute[] = BIKE_MODELS.map((entry) => ({
  brand: entry.brand,
  model: entry.model,
  brandSlug: slugify(entry.brand),
  modelSlug: slugify(entry.model)
}));

export function findModelBySlugs(brandSlug: string, modelSlug: string) {
  return MODEL_ROUTES.find((route) => route.brandSlug === brandSlug && route.modelSlug === modelSlug);
}

export function modelPath(brand: string, model: string) {
  return `/models/${slugify(brand)}/${slugify(model)}`;
}
