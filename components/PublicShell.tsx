import Link from "next/link";
import { BookOpen, Database, Gauge, Home, LayoutDashboard } from "lucide-react";

const navLinks = [
  { href: "/library", label: "Bike Library", icon: BookOpen },
  { href: "/models", label: "Models", icon: Gauge },
  { href: "/data-sources", label: "Data Sources", icon: Database }
];

// Chrome for the logged-out, inform-first experience. Deliberately cookie-free
// so public knowledge pages stay statically renderable; the Dashboard link
// simply lands on /login when there is no session.
export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Home className="h-5 w-5 text-amberline" aria-hidden="true" />
            <span className="text-lg font-semibold text-ink">350x Garage</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-steel transition hover:bg-paper hover:text-ink"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-steel transition hover:bg-paper hover:text-ink"
            >
              <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
              My garage
            </Link>
            <Link className="btn-primary" href="/signup">
              Track my bike
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 text-sm text-steel sm:px-6 lg:px-8">
          <strong className="text-ink">Disclaimer:</strong> Known issues and risk scores are early indicators
          aggregated from rider logs and public ownership discussions, not OEM-certified diagnostics.
        </div>
      </footer>
    </div>
  );
}
