import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { isDemoSupabaseConfig } from "@/lib/supabase/config";
import type { DiyGuide, DiyProduct } from "@/lib/types";
import { seedDiyGuides } from "./seedDiy";

// Public DIY reads: cookie-less anon client with the same graceful fallbacks as
// the blog (demo config, missing table, or empty DB → curated seed).
function anon() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

// Rows come back with products nested via the PostgREST relationship select.
type GuideRow = Omit<DiyGuide, "products"> & { diy_products: DiyProduct[] | null };

function withProducts(row: GuideRow): DiyGuide {
  const { diy_products, ...guide } = row;
  const products = (diy_products ?? []).slice().sort((a, b) => a.position - b.position);
  return { ...guide, products };
}

export async function getPublishedGuides(): Promise<DiyGuide[]> {
  if (isDemoSupabaseConfig()) return seedDiyGuides();
  const { data, error } = await anon()
    .from("diy_guides")
    .select("*, diy_products(*)")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error || !data || data.length === 0) return seedDiyGuides();
  return (data as GuideRow[]).map(withProducts);
}

export async function getGuideBySlug(slug: string): Promise<DiyGuide | null> {
  if (isDemoSupabaseConfig()) {
    return seedDiyGuides().find((guide) => guide.slug === slug) ?? null;
  }
  const { data, error } = await anon()
    .from("diy_guides")
    .select("*, diy_products(*)")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) return null;
  if (data) return withProducts(data as GuideRow);
  return seedDiyGuides().find((guide) => guide.slug === slug) ?? null;
}
