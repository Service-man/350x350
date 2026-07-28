"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdmin, adminWritesEnabled } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/knowledge/slugs";
import type { ActionState, DiyStep } from "@/lib/types";

function fail(error: string): ActionState {
  return { ok: false, error, ts: Date.now() };
}

// Steps arrive as parallel arrays (step_title[] + step_detail[]); pair and drop
// blanks so removed rows leave no gaps.
function parseSteps(formData: FormData): DiyStep[] {
  const titles = formData.getAll("step_title").map(String);
  const details = formData.getAll("step_detail").map(String);
  const steps: DiyStep[] = [];
  for (let i = 0; i < titles.length; i += 1) {
    const title = (titles[i] ?? "").trim();
    const detail = (details[i] ?? "").trim();
    if (title || detail) steps.push({ title, detail });
  }
  return steps;
}

type ProductInput = { title: string; description: string | null; amazon_url: string; approx_price: string | null; position: number };

function parseProducts(formData: FormData): ProductInput[] {
  const titles = formData.getAll("product_title").map(String);
  const urls = formData.getAll("product_url").map(String);
  const prices = formData.getAll("product_price").map(String);
  const descs = formData.getAll("product_desc").map(String);
  const products: ProductInput[] = [];
  for (let i = 0; i < titles.length; i += 1) {
    const title = (titles[i] ?? "").trim();
    const amazon_url = (urls[i] ?? "").trim();
    if (!title || !amazon_url) continue; // a product needs a name and a link
    products.push({
      title,
      amazon_url,
      description: (descs[i] ?? "").trim() || null,
      approx_price: (prices[i] ?? "").trim() || null,
      position: products.length
    });
  }
  return products;
}

export async function saveGuideAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await getAdmin();
  if (!admin) return fail("Not authorized.");
  if (!adminWritesEnabled()) return fail("Demo mode is read-only. Add Supabase env vars to save guides.");
  const client = createAdminClient();
  if (!client) return fail("Service role key missing; cannot write.");

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return fail("Title is required.");
  const slug = slugify(String(formData.get("slug") ?? "").trim() || title);
  if (!slug) return fail("Could not derive a slug from the title.");

  const status = formData.get("status") === "published" ? "published" : "draft";
  const existingPublishedAt = String(formData.get("published_at") ?? "").trim();
  const publishedAt = status === "published" ? existingPublishedAt || new Date().toISOString() : existingPublishedAt || null;
  const difficulty = ["easy", "medium", "advanced"].includes(String(formData.get("difficulty")))
    ? String(formData.get("difficulty"))
    : "easy";

  const guidePayload = {
    slug,
    title,
    summary: String(formData.get("summary") ?? "").trim() || null,
    brand: String(formData.get("brand") ?? "").trim() || null,
    model: String(formData.get("model") ?? "").trim() || null,
    component: String(formData.get("component") ?? "").trim() || null,
    difficulty,
    estimated_time: String(formData.get("estimated_time") ?? "").trim() || null,
    steps: parseSteps(formData),
    status,
    published_at: publishedAt
  };

  let guideId = id;
  if (id) {
    const { error } = await client.from("diy_guides").update(guidePayload).eq("id", id);
    if (error) return fail(error.message);
  } else {
    const { data, error } = await client.from("diy_guides").insert(guidePayload).select("id").single();
    if (error || !data) return fail(error?.message ?? "Could not create guide.");
    guideId = data.id as string;
  }

  // Replace the product set wholesale — simplest correct approach for a small list.
  await client.from("diy_products").delete().eq("guide_id", guideId);
  const products = parseProducts(formData).map((p) => ({ ...p, guide_id: guideId }));
  if (products.length > 0) {
    const { error } = await client.from("diy_products").insert(products);
    if (error) return fail(error.message);
  }

  revalidatePath("/admin/diy");
  revalidatePath("/diy");
  revalidatePath(`/diy/${slug}`);
  redirect("/admin/diy");
}

export async function deleteGuideAction(formData: FormData): Promise<void> {
  const admin = await getAdmin();
  if (!admin || !adminWritesEnabled()) return;
  const client = createAdminClient();
  if (!client) return;
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  await client.from("diy_guides").delete().eq("id", id); // products cascade
  revalidatePath("/admin/diy");
  revalidatePath("/diy");
  redirect("/admin/diy");
}
