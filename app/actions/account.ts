"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { isDemoSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";

function fail(error: string): ActionState {
  return { ok: false, error, ts: Date.now() };
}

// Full data deletion: storage files, logs, bikes, profile — and the auth user
// itself when the service role key is available. RLS scopes every DB delete
// to the caller.
export async function deleteMyDataAction(_prev: ActionState, _formData: FormData): Promise<ActionState> {
  if (isDemoSupabaseConfig()) {
    return fail("Demo mode has no stored data to delete. Connect real Supabase environment variables first.");
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return fail("Your session expired. Please log in again.");

  try {
    // Bill files live under {user_id}/{bike_id}/... — walk one folder level.
    const { data: folders } = await supabase.storage.from("service-bills").list(user.id);
    const paths: string[] = [];
    for (const folder of folders ?? []) {
      const { data: files } = await supabase.storage.from("service-bills").list(`${user.id}/${folder.name}`);
      for (const file of files ?? []) {
        paths.push(`${user.id}/${folder.name}/${file.name}`);
      }
    }
    if (paths.length > 0) {
      await supabase.storage.from("service-bills").remove(paths);
    }

    // symptom_logs first (FK to service_logs), then the rest.
    await supabase.from("symptom_logs").delete().eq("user_id", user.id);
    await supabase.from("service_logs").delete().eq("user_id", user.id);
    await supabase.from("bikes").delete().eq("user_id", user.id);
    await supabase.from("profiles").delete().eq("id", user.id);

    // Remove the auth account too when the server has admin rights.
    const admin = createAdminClient();
    if (admin) {
      await admin.auth.admin.deleteUser(user.id);
    }

    await supabase.auth.signOut();
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not delete your data. Please try again.");
  }

  redirect("/");
}
