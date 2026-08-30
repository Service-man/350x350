"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const adminLinks = [
  { href: "/admin_con", label: "Overview" },
  { href: "/admin_con/blog", label: "Blog posts" },
  { href: "/admin_con/diy", label: "DIY guides" }
];

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

export function AdminSidebar() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/admin_con" ? pathname === "/admin_con" : pathname.startsWith(href));

  return (
    <aside className="bg-ink text-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-56">
      <div className="flex h-full flex-col px-4 py-5">
        <Link href="/admin_con" className="mb-1 flex items-center gap-2.5 px-1.5 text-[14.5px] font-extrabold tracking-tight">
          <span className="inline-block h-[18px] w-[18px] rounded-[4px] bg-leaf" aria-hidden="true" />
          BikeKundli
        </Link>
        <span className="mb-6 px-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-lavdim">
          Admin console
        </span>
        <nav className="flex gap-1 overflow-x-auto lg:flex-1 lg:flex-col lg:overflow-visible">
          {adminLinks.map((link) => (
            <NavLink key={link.href} {...link} active={isActive(link.href)} />
          ))}
        </nav>
        <Link
          href="/"
          className="mt-4 hidden rounded-lg border border-bayline bg-bay px-3 py-2.5 text-[12.5px] text-lav transition hover:text-white lg:block"
        >
          ← Back to site
        </Link>
      </div>
    </aside>
  );
}

export function AdminShell({
  children,
  title,
  subtitle,
  action
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper">
      <AdminSidebar />
      <main className="lg:pl-56">
        <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-9">
          <header className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <p className="eyebrow mb-1.5">Internal tooling</p>
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
