import Link from "next/link";

const navLinks = [
  { href: "/library", label: "Library" },
  { href: "/models", label: "Models" },
  { href: "/diy", label: "DIY" },
  { href: "/blog", label: "Blog" },
  { href: "/data-sources", label: "Data" }
];

// Chrome for the logged-out, inform-first experience. Deliberately cookie-free
// so public knowledge pages stay statically renderable; the "My garage" link
// simply lands on /login when there is no session.
export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="bg-ink text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-9 gap-y-3 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 text-[17px] font-extrabold tracking-tight">
            <span className="inline-block h-[22px] w-[22px] rounded-[5px] bg-leaf" aria-hidden="true" />
            350x GARAGE
          </Link>
          <nav className="flex flex-wrap items-center gap-6 text-[13.5px]">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-lav transition hover:text-white">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-4 text-[13.5px]">
            <Link href="/dashboard" className="text-lav transition hover:text-white">
              My garage
            </Link>
            <Link
              className="inline-flex h-10 items-center rounded-md bg-leaf px-4 font-bold text-white transition hover:bg-[#6D28D9]"
              href="/signup"
            >
              Track my bike
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="bg-ink">
        <div className="mx-auto max-w-7xl px-4 py-5 text-xs leading-5 text-lavmute sm:px-6 lg:px-8">
          <strong className="font-bold text-lav">Disclaimer:</strong> Known issues and risk scores are early
          indicators aggregated from rider logs and public ownership discussions — not OEM-certified
          diagnostics.
        </div>
      </footer>
    </div>
  );
}
