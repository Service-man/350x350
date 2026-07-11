import Link from "next/link";
import {
  Bike,
  BookOpen,
  Database,
  Gauge,
  Home,
  LayoutDashboard,
  Settings,
  Stethoscope,
  Wrench
} from "lucide-react";

// The logged-in "my garage" area. Public knowledge pages (library, models,
// data sources) live under the Explore divider and never require login.
const garageLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/garage", label: "Garage", icon: Bike },
  { href: "/service-logs", label: "Service Logs", icon: Wrench },
  { href: "/symptoms", label: "Symptoms", icon: Stethoscope },
  { href: "/health", label: "Health", icon: Gauge },
  { href: "/settings", label: "Settings", icon: Settings }
];

const exploreLinks = [
  { href: "/library", label: "Bike Library", icon: BookOpen },
  { href: "/models", label: "Models", icon: Gauge },
  { href: "/data-sources", label: "Data Sources", icon: Database }
];

function NavLink({ href, label, icon: Icon }: (typeof garageLinks)[number]) {
  return (
    <Link
      href={href}
      className="flex shrink-0 items-center gap-3 rounded px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </Link>
  );
}

export function Sidebar() {
  return (
    <aside className="border-b border-stone-200 bg-ink text-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:border-b-0">
      <div className="flex h-full flex-col">
        <Link href="/" className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <Home className="h-6 w-6 text-amberline" aria-hidden="true" />
          <span className="text-lg font-semibold">350x Garage</span>
        </Link>
        <nav className="flex gap-1 overflow-x-auto px-3 py-3 lg:flex-1 lg:flex-col lg:overflow-visible">
          {garageLinks.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
          <span className="hidden px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-white/40 lg:block">
            Explore
          </span>
          {exploreLinks.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </nav>
      </div>
    </aside>
  );
}
