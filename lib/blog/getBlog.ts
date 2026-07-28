import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { isDemoSupabaseConfig } from "@/lib/supabase/config";
import type { BlogPost } from "@/lib/types";
import { seedBlogPosts } from "./seedBlog";

// Public blog reads use a cookie-less anon client (posts are public by design),
// with graceful fallbacks: demo config, a missing table, or an empty production
// database all fall back to the curated seed so the page is never blank.
function anon() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  if (isDemoSupabaseConfig()) return seedBlogPosts();
  const { data, error } = await anon()
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error || !data || data.length === 0) return seedBlogPosts();
  return data as BlogPost[];
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  if (isDemoSupabaseConfig()) {
    return seedBlogPosts().find((post) => post.slug === slug) ?? null;
  }
  const { data, error } = await anon()
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) return null;
  if (data) return data as BlogPost;
  // Fall back to the seed so the starter posts resolve on a fresh database.
  return seedBlogPosts().find((post) => post.slug === slug) ?? null;
}
