import Link from "next/link";
import {
  Activity,
  Bike,
  Database,
  Gauge,
  Home,
  LayoutDashboard,
  Settings,
  Stethoscope,
  Wrench
} from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/garage", label: "Garage", icon: Bike },
  { href: "/service-logs", label: "Service Logs", icon: Wrench },
  { href: "/symptoms", label: "Symptoms", icon: Stethoscope },
  { href: "/problem-radar", label: "Problem Radar", icon: Activity },
  { href: "/health", label: "Health", icon: Gauge },
  { href: "/data-sources", label: "Data Sources", icon: Database },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function Sidebar() {
  return (
    <aside className="border-b border-stone-200 bg-ink text-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:border-b-0">
      <div className="flex h-full flex-col">
        <Link href="/" className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <Home className="h-6 w-6 text-amberline" aria-hidden="true" />
          <span className="text-lg font-semibold">350x Garage</span>
        </Link>
        <nav className="flex gap-1 overflow-x-auto px-3 py-3 lg:flex-1 lg:flex-col lg:overflow-visible">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex shrink-0 items-center gap-3 rounded px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
