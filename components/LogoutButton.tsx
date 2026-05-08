"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button className="btn-secondary" onClick={logout} type="button">
      <LogOut className="h-4 w-4" aria-hidden="true" />
      Logout
    </button>
  );
}
