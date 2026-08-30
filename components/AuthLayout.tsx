import Link from "next/link";

// Shared chrome for /login and /signup, matching the redesign: pinstriped
// paper, wordmark, mono eyebrow, 900-weight headline, then the dark auth card.
export function AuthLayout({
  eyebrow,
  title,
  subtitle,
  children
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-paper px-4">
      <div className="pinstripes pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative w-full max-w-[440px] py-10">
        <Link href="/" className="mb-9 flex items-center gap-2.5 text-[15px] font-extrabold tracking-tight text-ink">
          <span className="inline-block h-5 w-5 rounded-[5px] bg-leaf" aria-hidden="true" />
          BikeKundli
        </Link>
        <p className="eyebrow mb-3">{eyebrow}</p>
        <h1 className="text-4xl font-black tracking-[-0.03em] text-ink">{title}</h1>
        <p className="mb-7 mt-2.5 text-[14.5px] text-steel">{subtitle}</p>
        {children}
      </div>
    </main>
  );
}
