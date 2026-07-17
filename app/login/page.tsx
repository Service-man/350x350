import { AuthForm } from "@/components/AuthForm";
import { AuthLayout } from "@/components/AuthLayout";

export default function LoginPage() {
  return (
    <AuthLayout
      eyebrow="Welcome back, rider"
      title="Back to the garage."
      subtitle="Your logs, risk scores, and service history are waiting."
    >
      <AuthForm mode="login" />
    </AuthLayout>
  );
}
