"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const supabase = createClient();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const fullName = String(formData.get("full_name") ?? "");

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
    <form action={onSubmit} className="space-y-4 rounded border border-stone-200 bg-white p-6 shadow-soft">
      {mode === "signup" ? (
        <label className="block">
          <span className="label">Full name</span>
          <input className="field mt-1" name="full_name" placeholder="Arjun Menon" />
        </label>
      ) : null}
      <label className="block">
        <span className="label">Email</span>
        <input className="field mt-1" name="email" type="email" required placeholder="you@example.com" />
      </label>
      <label className="block">
        <span className="label">Password</span>
        <input className="field mt-1" name="password" type="password" minLength={6} required />
      </label>
      {error ? <p className="rounded bg-red-50 p-3 text-sm text-danger">{error}</p> : null}
      <button className="btn-primary w-full" disabled={loading} type="submit">
        {loading ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
      </button>
      <p className="text-center text-sm text-steel">
        {mode === "login" ? "New to 350x Garage?" : "Already have an account?"}{" "}
        <Link className="font-semibold text-leaf" href={mode === "login" ? "/signup" : "/login"}>
          {mode === "login" ? "Sign up" : "Log in"}
        </Link>
      </p>
    </form>
  );
}
