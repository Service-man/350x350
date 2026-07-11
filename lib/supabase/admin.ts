import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { isDemoSupabaseConfig } from "@/lib/supabase/config";

// Service-role client for batch jobs (ingestion, seed sync, account deletion).
// SERVER-ONLY: never import this from a client component — the service role
// key bypasses RLS. Returns null when the key is absent so callers can degrade
// gracefully instead of crashing builds.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey || isDemoSupabaseConfig()) return null;

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}
