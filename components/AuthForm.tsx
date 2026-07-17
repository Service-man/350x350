"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DEMO_SESSION_COOKIE } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";

function isDemoMode() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !url || !key || url.includes("example.supabase.co") || key === "dummy";
}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const fullName = String(formData.get("full_name") ?? "");

    if (isDemoMode()) {
      document.cookie = `${DEMO_SESSION_COOKIE}=1; path=/; max-age=86400; SameSite=Lax`;
      window.localStorage.setItem(
        "garage_demo_profile",
        JSON.stringify({ email, fullName: fullName || "Demo Rider" })
      );
      router.push("/dashboard");
      router.refresh();
      return;
    }

    const supabase = createClient();
    const result =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } }
          });

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
      return;
    }

    if (mode === "signup" && result.data.user) {
      await supabase.from("profiles").upsert({
        id: result.data.user.id,
        full_name: fullName || null
      });
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <>
      <form action={onSubmit} className="panel-dark space-y-4 p-7">
        {mode === "signup" ? (
          <label className="block">
            <span className="label-dark mb-1.5">Full name</span>
            <input className="field-dark" name="full_name" placeholder="Arjun Menon" />
          </label>
        ) : null}
        <label className="block">
          <span className="label-dark mb-1.5">Email</span>
          <input className="field-dark" name="email" type="email" required placeholder="you@example.com" />
        </label>
        <label className="block">
          <span className="label-dark mb-1.5">Password</span>
          <input className="field-dark" name="password" type="password" minLength={6} required />
        </label>
        {error ? (
          <p className="rounded border border-danger/40 bg-danger/15 p-3 text-sm text-red-300">{error}</p>
        ) : null}
        <button className="btn-primary w-full py-3.5 text-[15px] font-extrabold" disabled={loading} type="submit">
          {loading ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
        </button>
        <p className="text-center text-[13px] text-lavmute">
          {mode === "login" ? "New here?" : "Already have an account?"}{" "}
          <Link className="font-bold text-lav hover:text-white" href={mode === "login" ? "/signup" : "/login"}>
            {mode === "login" ? "Sign up" : "Log in"}
          </Link>
        </p>
      </form>
      {isDemoMode() ? (
        <p className="mt-4 rounded border border-stone-300 bg-mint p-3 font-mono text-xs text-lavmute">
          demo mode active — connect Supabase env vars to go live
        </p>
      ) : null}
    </>
  );
}
