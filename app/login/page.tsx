import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-md">
        <p className="text-sm font-semibold uppercase tracking-wide text-leaf">350x Garage</p>
        <h1 className="mt-3 text-3xl font-semibold text-ink">Log in</h1>
        <p className="mb-6 mt-2 text-sm text-steel">Continue logging your bike health and service history.</p>
        <AuthForm mode="login" />
      </div>
    </main>
  );
}
