import { AuthForm } from "@/components/AuthForm";
import { AuthLayout } from "@/components/AuthLayout";

export default function SignupPage() {
  return (
    <AuthLayout
      eyebrow="Join the garage"
      title="Track your machine."
      subtitle="Opt in to service logs, symptom tracking, and odometer-aware risk scores."
    >
      <AuthForm mode="signup" />
    </AuthLayout>
  );
}
