"use client";

import { useActionState } from "react";
import Link from "next/link";
import { savePostAction } from "@/app/actions/blog";
import { RichTextEditor } from "@/components/RichTextEditor";
import type { ActionState, BlogPost } from "@/lib/types";

const initial: ActionState = { ok: false };

export function BlogPostForm({ post }: { post?: BlogPost }) {
  const [state, action, pending] = useActionState(savePostAction, initial);

  return (
    <form action={action} className="space-y-5">
      {post?.id ? <input type="hidden" name="id" value={post.id} /> : null}
      <input type="hidden" name="published_at" value={post?.published_at ?? ""} />

      <div className="grid gap-4 md:grid-cols-[1fr_140px]">
        <label className="block">
          <span className="label mb-1.5">Title</span>
          <input className="field" name="title" defaultValue={post?.title ?? ""} required placeholder="E20 petrol vs traditional petrol…" />
        </label>
        <label className="block">
          <span className="label mb-1.5">Cover emoji</span>
          <input className="field" name="cover_emoji" defaultValue={post?.cover_emoji ?? ""} placeholder="⛽" maxLength={4} />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="label mb-1.5">Slug (optional — derived from title)</span>
          <input className="field" name="slug" defaultValue={post?.slug ?? ""} placeholder="e20-petrol-vs-traditional" />
        </label>
        <label className="block">
          <span className="label mb-1.5">Author</span>
          <input className="field" name="author_name" defaultValue={post?.author_name ?? "350x Garage"} />
        </label>
      </div>

      <label className="block">
        <span className="label mb-1.5">Excerpt</span>
        <textarea className="field" name="excerpt" defaultValue={post?.excerpt ?? ""} rows={2} placeholder="One or two sentences shown on the blog index." />
      </label>

      <label className="block">
        <span className="label mb-1.5">Tags (comma-separated)</span>
        <input className="field" name="tags" defaultValue={post?.tags?.join(", ") ?? ""} placeholder="Fuel, E20, Maintenance" />
      </label>

      <div>
        <span className="label mb-1.5">Body</span>
        <RichTextEditor name="body_html" defaultValue={post?.body_html ?? ""} />
      </div>

      {state.error ? <p className="rounded border border-danger/40 bg-red-50 p-3 text-sm text-danger">{state.error}</p> : null}

      <div className="flex flex-wrap items-center gap-3">
        <button className="btn-primary" name="status" value="published" type="submit" disabled={pending}>
          {pending ? "Saving…" : "Publish"}
        </button>
        <button className="btn-secondary" name="status" value="draft" type="submit" disabled={pending}>
          Save as draft
        </button>
        <Link className="text-[13px] font-bold text-steel hover:text-ink" href="/admin/blog">
          Cancel
        </Link>
      </div>
    </form>
  );
}
