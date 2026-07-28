"use client";

import { deletePostAction } from "@/app/actions/blog";

// Small client wrapper so the delete form can confirm before submitting.
export function DeletePostButton({ id }: { id: string }) {
  return (
    <form
      action={deletePostAction}
      onSubmit={(e) => {
        if (!window.confirm("Delete this post permanently?")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button className="btn-secondary border-danger text-danger hover:bg-danger" type="submit">
        Delete
      </button>
    </form>
  );
}
