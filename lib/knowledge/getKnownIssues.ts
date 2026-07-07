import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { isDemoSupabaseConfig } from "@/lib/supabase/config";
import type { KnownIssue } from "@/lib/types";
import { seedAsKnownIssueRows } from "./seedKnownIssues";

export type KnownIssueFilters = {
  brand?: string;
  model?: string;
  component?: string;
  severity?: string;
  mileageBand?: string;
  q?: string;
};

// Public knowledge reads use a cookie-less anon client: the table is publicly
// readable by design and skipping cookies() keeps public pages statically
// renderable. Falls back to the curated TypeScript seed when Supabase env vars
// are absent (demo/preview deployments).
async function fetchAllKnownIssues(): Promise<KnownIssue[]> {
  if (isDemoSupabaseConfig()) {
    return seedAsKnownIssueRows();
  }

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
  const { data, error } = await supabase
    .from("known_issues")
    .select("*")
    .order("mention_count", { ascending: false });
  if (error || !data) return [];
  return data as KnownIssue[];
}

export async function getKnownIssues(filters: KnownIssueFilters = {}): Promise<KnownIssue[]> {
  const rows = await fetchAllKnownIssues();
  const q = filters.q?.trim().toLowerCase();

  return rows.filter((issue) => {
    if (filters.brand && issue.brand !== filters.brand) return false;
    if (filters.model && issue.model !== filters.model) return false;
    if (filters.component && issue.component !== filters.component) return false;
    if (filters.severity && issue.severity !== filters.severity) return false;
    if (filters.mileageBand && issue.mileage_band !== filters.mileageBand) return false;
    if (q) {
      const haystack = [
        issue.brand,
        issue.model,
        issue.component,
        issue.issue_title,
        issue.issue_summary ?? "",
        issue.symptoms_to_watch ?? "",
        issue.rpm_band ?? ""
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}
