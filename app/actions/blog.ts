"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdmin, adminWritesEnabled } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { sanitizeHtml } from "@/lib/admin/sanitize";
import { slugify } from "@/lib/knowledge/slugs";
import type { ActionState } from "@/lib/types";

function fail(error: string): ActionState {
  return { ok: false, error, ts: Date.now() };
}

function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 8);
}

export async function savePostAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await getAdmin();
  if (!admin) return fail("Not authorized.");
  if (!adminWritesEnabled()) return fail("Demo mode is read-only. Add Supabase env vars to save posts.");
  const client = createAdminClient();
  if (!client) return fail("Service role key missing; cannot write.");

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return fail("Title is required.");

  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug = slugify(slugInput || title);
  if (!slug) return fail("Could not derive a slug from the title.");

  const status = formData.get("status") === "published" ? "published" : "draft";
  const existingPublishedAt = String(formData.get("published_at") ?? "").trim();
  const publishedAt = status === "published" ? existingPublishedAt || new Date().toISOString() : existingPublishedAt || null;

  const payload = {
    slug,
    title,
    excerpt: String(formData.get("excerpt") ?? "").trim() || null,
    body_html: sanitizeHtml(String(formData.get("body_html") ?? "")),
    cover_emoji: String(formData.get("cover_emoji") ?? "").trim() || null,
    tags: parseTags(String(formData.get("tags") ?? "")),
    author_name: String(formData.get("author_name") ?? "").trim() || null,
    status,
    published_at: publishedAt
  };

  const result = id
    ? await client.from("blog_posts").update(payload).eq("id", id)
    : await client.from("blog_posts").insert(payload);
  if (result.error) return fail(result.error.message);

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  redirect("/admin/blog");
}

export async function deletePostAction(formData: FormData): Promise<void> {
  const admin = await getAdmin();
  if (!admin || !adminWritesEnabled()) return;
  const client = createAdminClient();
  if (!client) return;
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  await client.from("blog_posts").delete().eq("id", id);
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  redirect("/admin/blog");
}
