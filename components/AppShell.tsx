import { Sidebar, type BayInfo } from "@/components/Sidebar";
import { getAdmin } from "@/lib/admin/auth";

export async function AppShell({
  children,
  title,
  subtitle,
  action,
  bay
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  bay?: BayInfo;
}) {
  const isAdmin = Boolean(await getAdmin());
  return (
    <div className="min-h-screen bg-paper">
      <Sidebar bay={bay} isAdmin={isAdmin} />
      <main className="lg:pl-56">
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-9">
          <header className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <h1 className="text-[32px] font-black tracking-[-0.03em] text-ink">{title}</h1>
              {subtitle ? <p className="mt-1.5 max-w-3xl text-[13.5px] text-steel">{subtitle}</p> : null}
            </div>
            {action}
          </header>
          {children}
        </div>
      </main>
    </div>
  );
}
