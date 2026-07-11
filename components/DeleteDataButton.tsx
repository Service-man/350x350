"use client";

import { useActionState, useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteMyDataAction } from "@/app/actions/account";
import type { ActionState } from "@/lib/types";

const initialState: ActionState = { ok: false };

// Two-step confirm before the irreversible server action runs.
export function DeleteDataButton() {
  const [confirming, setConfirming] = useState(false);
  const [state, dispatch, pending] = useActionState(deleteMyDataAction, initialState);

  if (!confirming) {
    return (
      <button className="btn-secondary" type="button" onClick={() => setConfirming(true)}>
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        Delete my data
      </button>
    );
  }

  return (
    <div className="rounded border border-danger bg-red-50 p-4">
      <p className="text-sm font-medium text-danger">
        This permanently deletes your bikes, service logs, symptoms, uploaded bills, profile, and account.
        There is no undo.
      </p>
      {state.error && !pending ? <p className="mt-2 text-sm text-danger">{state.error}</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <form action={dispatch}>
          <button
            className="inline-flex items-center justify-center gap-2 rounded bg-danger px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
            disabled={pending}
            type="submit"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            {pending ? "Deleting..." : "Yes, permanently delete"}
          </button>
        </form>
        <button className="btn-secondary" type="button" disabled={pending} onClick={() => setConfirming(false)}>
          Cancel
        </button>
      </div>
    </div>
  );
}
