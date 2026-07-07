import { redirect } from "next/navigation";

// The Problem Radar grew into the public Bike Library. Old links keep working.
export default async function ProblemRadarPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  for (const key of ["model", "component", "q"] as const) {
    const value = params[key];
    if (value) query.set(key, value);
  }
  const suffix = query.toString();
  redirect(suffix ? `/library?${suffix}` : "/library");
}
