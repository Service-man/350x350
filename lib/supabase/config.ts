export const DEMO_SESSION_COOKIE = "garage_demo_session";

export function isDemoSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !url || !key || url.includes("example.supabase.co") || key === "dummy";
}
