import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { isDemoSupabaseConfig } from "@/lib/supabase/config";

// Admin access is an email allowlist: a logged-in user whose email is in the
// ADMIN_EMAILS env var (comma-separated) may reach /admin. No schema change,
// managed entirely from environment settings.

export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails().includes(email.toLowerCase());
}

// In demo mode there is no real auth, so the panel is explorable (writes stay
// disabled by the actions' demo checks). In real mode the email must be allowed.
export async function getAdmin() {
  const user = await getUser();
  if (isDemoSupabaseConfig()) return user; // demo cookie session, if present
  if (!user) return null;
  return isAdminEmail(user.email) ? user : null;
}

export async function requireAdmin() {
  const user = await getUser();
  if (!user) redirect("/login?next=/admin");
  if (!isDemoSupabaseConfig() && !isAdminEmail(user.email)) redirect("/");
  return user;
}

// True when the current admin can actually write (i.e. not demo mode).
export function adminWritesEnabled(): boolean {
  return !isDemoSupabaseConfig();
}
