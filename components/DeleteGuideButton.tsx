"use client";

import { deleteGuideAction } from "@/app/actions/diy";

export function DeleteGuideButton({ id }: { id: string }) {
  return (
    <form
      action={deleteGuideAction}
      onSubmit={(e) => {
        if (!window.confirm("Delete this guide and its product links permanently?")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button className="btn-secondary border-danger text-danger hover:bg-danger" type="submit">
        Delete
      </button>
    </form>
  );
}
