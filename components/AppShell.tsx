import { Sidebar } from "@/components/Sidebar";

export function AppShell({
  children,
  title,
  subtitle
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="min-h-screen bg-paper">
      <Sidebar />
      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <header className="mb-6">
            <h1 className="text-3xl font-semibold text-ink">{title}</h1>
            {subtitle ? <p className="mt-2 max-w-3xl text-sm text-steel">{subtitle}</p> : null}
          </header>
          {children}
        </div>
      </main>
    </div>
  );
}
