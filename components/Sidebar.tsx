"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// The logged-in "my garage" area. Public knowledge pages (library, models,
// data sources) live under the Explore divider and never require login.
const garageLinks = [
  { href: "/kundli", label: "Kundli chat" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/garage", label: "Garage" },
  { href: "/service-logs", label: "Service logs" },
  { href: "/symptoms", label: "Symptoms" },
  { href: "/health", label: "Health" },
  { href: "/settings", label: "Settings" }
];

const exploreLinks = [
  { href: "/library", label: "Bike library" },
  { href: "/models", label: "Models" },
  { href: "/diy", label: "DIY & Fixes" },
  { href: "/blog", label: "Blog" }
];

export type BayInfo = { title: string; meta: string };

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "shrink-0 rounded-[7px] px-3 py-2.5 text-[13.5px] transition",
        active ? "bg-leaf font-bold text-white" : "text-lav hover:bg-white/5 hover:text-white"
      )}
    >
      {label}
    </Link>
  );
}

export function Sidebar({ bay }: { bay?: BayInfo }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="bg-ink text-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-56">
      <div className="flex h-full flex-col px-4 py-5">
        <Link href="/" className="mb-6 flex items-center gap-2.5 px-1.5 text-[14.5px] font-extrabold tracking-tight">
          <span className="inline-block h-[18px] w-[18px] rounded-[4px] bg-leaf" aria-hidden="true" />
          BikeKundli
        </Link>
        <nav className="flex gap-1 overflow-x-auto lg:flex-1 lg:flex-col lg:overflow-visible">
          {garageLinks.map((link) => (
            <NavLink key={link.href} {...link} active={isActive(link.href)} />
          ))}
          <span className="hidden px-3 pb-1.5 pt-5 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-lavdim lg:block">
            Explore
          </span>
          {exploreLinks.map((link) => (
            <NavLink key={link.href} {...link} active={isActive(link.href)} />
          ))}
        </nav>
        {bay ? (
          <div className="mt-4 hidden rounded-lg border border-bayline bg-bay p-3 lg:block">
            <p className="mb-1.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.18em] text-lavmute">
              In the bay
            </p>
            <p className="text-[13px] font-bold">{bay.title}</p>
            <p className="text-[11.5px] text-lavmute">{bay.meta}</p>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
