import Link from "next/link";
import { BookOpen, CalendarRange, Factory, GaugeCircle, Wrench } from "lucide-react";
import { ModelPicker } from "@/components/ModelPicker";
import { PublicShell } from "@/components/PublicShell";
import { MODEL_ROUTES } from "@/lib/knowledge/slugs";

const steps = [
  {
    title: "Pick your model",
    detail: "Brand, model, and optionally the manufacturing year. No signup needed.",
    icon: GaugeCircle
  },
  {
    title: "See what to expect",
    detail: "Known issues by service checkpoint, batch-specific problems, and RPM-band quirks.",
    icon: BookOpen
  },
  {
    title: "Track your own bike (optional)",
    detail: "When you want odometer-aware risk scores, opt in and log services and symptoms.",
    icon: Wrench
  }
];

export default function LandingPage() {
  return (
    <PublicShell>
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-leaf">350x Garage</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-tight text-ink sm:text-6xl">
            Know your bike before the mechanic does.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-steel">
            See the known problems, service checkpoints, and typical repair costs for 350cc+ motorcycles in
            India — organized by mileage, manufacturing batch, and even RPM band. Free to browse, no account
            needed.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="btn-primary" href="/models">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              See problems for my bike
            </Link>
            <Link className="btn-secondary" href="/signup">
              <Wrench className="h-4 w-4" aria-hidden="true" />
              Track my bike
            </Link>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="rounded border border-stone-200 bg-white p-4">
                  <Icon className="h-5 w-5 text-leaf" aria-hidden="true" />
                  <p className="mt-3 text-sm font-semibold text-ink">
                    {index + 1}. {step.title}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-steel">{step.detail}</p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded border border-stone-200 bg-white p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-ink">What goes wrong with my bike?</h2>
          <p className="mb-5 mt-1 text-sm text-steel">Pick your motorcycle to see its known-issue map.</p>
          <ModelPicker />
          <div className="mt-6 border-t border-stone-200 pt-4">
            <p className="label">Popular models</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {MODEL_ROUTES.filter((route) => route.entry.popular)
                .slice(0, 8)
                .map((route) => (
                  <Link
                    key={`${route.brandSlug}-${route.modelSlug}`}
                    href={`/models/${route.brandSlug}/${route.modelSlug}`}
                    className="rounded bg-paper px-3 py-1.5 text-xs font-semibold text-road transition hover:bg-mint hover:text-leaf"
                  >
                    {route.model}
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </section>
      <section className="border-t border-stone-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <CalendarRange className="h-6 w-6 text-leaf" aria-hidden="true" />
            <h3 className="mt-3 font-semibold text-ink">Service checkpoints</h3>
            <p className="mt-2 text-sm leading-6 text-steel">
              What riders typically face at 500, 5,000, 10,000, and 20,000 km — with the preventive action for
              each, so you walk into the service centre informed.
            </p>
          </div>
          <div>
            <Factory className="h-6 w-6 text-leaf" aria-hidden="true" />
            <h3 className="mt-3 font-semibold text-ink">Batch-specific issues</h3>
            <p className="mt-2 text-sm leading-6 text-steel">
              Some problems only affect certain manufacturing years. Tell us your year and we highlight what
              applies to your build.
            </p>
          </div>
          <div>
            <GaugeCircle className="h-6 w-6 text-leaf" aria-hidden="true" />
            <h3 className="mt-3 font-semibold text-ink">RPM-band quirks</h3>
            <p className="mt-2 text-sm leading-6 text-steel">
              Vibration bands, fan cycles, buzz zones — behaviour that shows up at specific revs, so you can
              tell character from a real problem.
            </p>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
