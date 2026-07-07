import { ShieldCheck, UserCircle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { DeleteDataButton } from "@/components/DeleteDataButton";
import { LogoutButton } from "@/components/LogoutButton";
import { requireUser, createClient } from "@/lib/supabase/server";
import { isDemoSupabaseConfig } from "@/lib/supabase/config";
import { demoProfile } from "@/lib/demo/data";

export default async function SettingsPage() {
  const user = await requireUser();
  let profile = demoProfile;

  if (!isDemoSupabaseConfig()) {
    const supabase = await createClient();
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    profile = data ?? demoProfile;
  }

  return (
    <AppShell title="Settings" subtitle="Profile, privacy notes, and account actions for the MVP.">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="panel">
          <UserCircle className="h-7 w-7 text-leaf" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-semibold text-ink">Profile</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="label">Email</dt>
              <dd className="mt-1 text-road">{user.email}</dd>
            </div>
            <div>
              <dt className="label">Full name</dt>
              <dd className="mt-1 text-road">{profile?.full_name ?? "Not set"}</dd>
            </div>
            <div>
              <dt className="label">City</dt>
              <dd className="mt-1 text-road">{profile?.city ?? "Not set"}</dd>
            </div>
          </dl>
          <div className="mt-5">
            <LogoutButton />
          </div>
        </section>
        <section className="panel">
          <ShieldCheck className="h-7 w-7 text-leaf" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-semibold text-ink">Privacy note</h2>
          <p className="mt-3 text-sm leading-6 text-steel">
            Tracking is opt-in: this app stores only the bike, service, symptom, and bill data you choose to
            submit, protected by row-level security. The public knowledge base is sourced from curated research
            and compliant APIs — no social media scraping, no OCR, no predictive-maintenance models.
          </p>
          <div className="mt-5">
            <DeleteDataButton />
          </div>
        </section>
      </div>
    </AppShell>
  );
}
