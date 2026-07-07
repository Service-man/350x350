import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { DEMO_SESSION_COOKIE, isDemoSupabaseConfig } from "@/lib/supabase/config";

type CookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server components cannot set cookies; middleware handles refresh.
          }
        }
      }
    }
  );
}

export async function getUser() {
  const cookieStore = await cookies();
  if (isDemoSupabaseConfig()) {
    // No real Supabase to ask: the demo cookie is the whole session. Without
    // it, treat the visitor as logged out (requireUser then redirects) instead
    // of crashing on a client built from missing env vars.
    if (cookieStore.get(DEMO_SESSION_COOKIE)?.value === "1") {
      return {
        id: "00000000-0000-4000-8000-000000000350",
        email: "demo@350xgarage.in"
      };
    }
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user;
}

export async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}
