import { AuthForm } from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-md">
        <p className="text-sm font-semibold uppercase tracking-wide text-leaf">350x Garage</p>
        <h1 className="mt-3 text-3xl font-semibold text-ink">Create account</h1>
        <p className="mb-6 mt-2 text-sm text-steel">Start with email/password auth for this MVP.</p>
        <AuthForm mode="signup" />
      </div>
    </main>
  );
}
