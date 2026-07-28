import { createAdminClient } from "@/lib/supabase/admin";
import { seedBlogPosts } from "@/lib/blog/seedBlog";
import { seedDiyGuides } from "@/lib/diy/seedDiy";
import type { BlogPost, DiyGuide, DiyProduct } from "@/lib/types";

// Admin-side reads use the service role so drafts are visible too. In demo mode
// (no service key) they return the curated seed, so /admin is fully explorable.

export async function adminListPosts(): Promise<BlogPost[]> {
  const admin = createAdminClient();
  if (!admin) return seedBlogPosts();
  const { data, error } = await admin.from("blog_posts").select("*").order("updated_at", { ascending: false });
  if (error || !data) return [];
  return data as BlogPost[];
}

export async function adminGetPost(id: string): Promise<BlogPost | null> {
  const admin = createAdminClient();
  if (!admin) return seedBlogPosts().find((post) => post.id === id) ?? null;
  const { data } = await admin.from("blog_posts").select("*").eq("id", id).maybeSingle();
  return (data as BlogPost) ?? null;
}

type GuideRow = Omit<DiyGuide, "products"> & { diy_products: DiyProduct[] | null };

function withProducts(row: GuideRow): DiyGuide {
  const { diy_products, ...guide } = row;
  const products = (diy_products ?? []).slice().sort((a, b) => a.position - b.position);
  return { ...guide, products };
}

export async function adminListGuides(): Promise<DiyGuide[]> {
  const admin = createAdminClient();
  if (!admin) return seedDiyGuides();
  const { data, error } = await admin
    .from("diy_guides")
    .select("*, diy_products(*)")
    .order("updated_at", { ascending: false });
  if (error || !data) return [];
  return (data as GuideRow[]).map(withProducts);
}

export async function adminGetGuide(id: string): Promise<DiyGuide | null> {
  const admin = createAdminClient();
  if (!admin) return seedDiyGuides().find((guide) => guide.id === id) ?? null;
  const { data } = await admin.from("diy_guides").select("*, diy_products(*)").eq("id", id).maybeSingle();
  return data ? withProducts(data as GuideRow) : null;
}
