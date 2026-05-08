import Link from "next/link";
import { Activity, Bike, FileText, Gauge, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-paper">
      <section className="mx-auto grid min-h-[88vh] max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-leaf">350x Garage</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-tight text-ink sm:text-6xl">
            Know your bike before the mechanic does.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-steel">
            Track common problems, service costs, and component risk for 350cc+ motorcycles in India.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="btn-primary" href="/garage">
              <Bike className="h-4 w-4" aria-hidden="true" />
              Add my bike
            </Link>
            <Link className="btn-secondary" href="/problem-radar">
              <Activity className="h-4 w-4" aria-hidden="true" />
              View problem radar
            </Link>
          </div>
        </div>
        <div className="rounded border border-stone-200 bg-white p-5 shadow-soft">
          <div className="rounded bg-ink p-5 text-white">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white/70">Component Risk</span>
              <Gauge className="h-5 w-5 text-amberline" aria-hidden="true" />
            </div>
            <div className="mt-6 space-y-4">
              {[
                ["Battery", "64", "Medium"],
                ["Chain/Sprocket", "78", "High"],
                ["Brake Pads", "28", "Low"]
              ].map(([label, score, level]) => (
                <div key={label}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span>{label}</span>
                    <span>{score} · {level}</span>
                  </div>
                  <div className="h-2 rounded bg-white/15">
                    <div className="h-2 rounded bg-amberline" style={{ width: `${score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ["Add your bike", Bike],
              ["Log symptoms and service bills", FileText],
              ["Compare against similar riders", ShieldCheck]
            ].map(([label, Icon], index) => {
              const DisplayIcon = Icon as typeof Bike;
              return (
                <div key={String(label)} className="rounded border border-stone-200 p-4">
                  <DisplayIcon className="h-5 w-5 text-leaf" aria-hidden="true" />
                  <p className="mt-3 text-sm font-semibold text-ink">{index + 1}. {String(label)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section className="border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-steel sm:px-6 lg:px-8">
          <strong className="text-ink">Disclaimer:</strong> Risk scores are early indicators based on rider logs and service history, not OEM-certified diagnostics.
        </div>
      </section>
    </main>
  );
}
