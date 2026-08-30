import Link from "next/link";
import { ModelPicker } from "@/components/ModelPicker";
import { PublicShell } from "@/components/PublicShell";
import { MODEL_ROUTES } from "@/lib/knowledge/slugs";

const features = [
  {
    eyebrow: "01 — Checkpoints",
    title: "Service checkpoints",
    detail: "What riders face at 500, 5k, 10k, 20k km — and the preventive move for each."
  },
  {
    eyebrow: "02 — Batch intel",
    title: "Batch-specific issues",
    detail: "Some faults belong to certain build years. We flag what applies to yours."
  },
  {
    eyebrow: "03 — RPM quirks",
    title: "RPM-band quirks",
    detail: "Buzz zones and vibration bands — character vs. a real problem."
  }
];

// Stylized motorcycle illustration from the design mock.
function MotorcycleArt() {
  return (
    <svg viewBox="0 0 900 330" className="block w-full" role="img" aria-label="Stylized motorcycle silhouette with speed lines">
      <defs>
        <linearGradient id="tankG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#5B21B6" />
        </linearGradient>
        <radialGradient id="glowG" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#7C3AED" stopOpacity=".35" />
          <stop offset="1" stopColor="#7C3AED" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="460" cy="250" rx="340" ry="90" fill="url(#glowG)" />
      <g stroke="#7C3AED" strokeLinecap="round">
        <line x1="30" y1="120" x2="180" y2="120" strokeWidth="5" opacity=".7" />
        <line x1="70" y1="155" x2="230" y2="155" strokeWidth="5" opacity=".45" />
        <line x1="20" y1="190" x2="150" y2="190" strokeWidth="5" opacity=".55" />
        <line x1="90" y1="225" x2="200" y2="225" strokeWidth="5" opacity=".3" />
      </g>
      <ellipse cx="470" cy="302" rx="310" ry="12" fill="#7C3AED" opacity=".14" />
      <g fill="none" stroke="#0E0B16">
        <circle cx="250" cy="235" r="62" strokeWidth="13" />
        <circle cx="700" cy="235" r="62" strokeWidth="13" />
      </g>
      <g fill="none" stroke="#7C3AED">
        <circle cx="250" cy="235" r="40" strokeWidth="3" />
        <circle cx="700" cy="235" r="40" strokeWidth="3" />
        <line x1="250" y1="200" x2="250" y2="270" strokeWidth="3" />
        <line x1="220" y1="253" x2="280" y2="217" strokeWidth="3" />
        <line x1="220" y1="217" x2="280" y2="253" strokeWidth="3" />
        <line x1="700" y1="200" x2="700" y2="270" strokeWidth="3" />
        <line x1="670" y1="253" x2="730" y2="217" strokeWidth="3" />
        <line x1="670" y1="217" x2="730" y2="253" strokeWidth="3" />
      </g>
      <circle cx="250" cy="235" r="9" fill="#7C3AED" />
      <circle cx="700" cy="235" r="9" fill="#7C3AED" />
      <rect x="360" y="192" width="190" height="72" rx="16" fill="#0E0B16" />
      <polygon points="185,178 262,160 376,154 384,194 220,196" fill="#0E0B16" />
      <polygon points="150,166 215,156 222,192 158,190" fill="#0E0B16" />
      <polygon points="374,152 560,132 606,174 392,194" fill="url(#tankG)" />
      <g stroke="#0E0B16" strokeLinecap="round">
        <line x1="608" y1="142" x2="700" y2="235" strokeWidth="11" />
        <line x1="596" y1="170" x2="552" y2="240" strokeWidth="9" />
        <line x1="392" y1="186" x2="342" y2="238" strokeWidth="9" />
        <line x1="250" y1="235" x2="368" y2="222" strokeWidth="9" />
        <line x1="608" y1="142" x2="578" y2="102" strokeWidth="8" />
        <line x1="556" y1="96" x2="600" y2="106" strokeWidth="8" />
        <line x1="540" y1="262" x2="716" y2="276" strokeWidth="10" />
      </g>
      <circle cx="622" cy="140" r="15" fill="#A78BFA" />
      <circle cx="622" cy="140" r="7" fill="#F7F5FA" />
      <g stroke="#A78BFA" strokeLinecap="round" opacity=".8">
        <line x1="648" y1="128" x2="720" y2="112" strokeWidth="4" />
        <line x1="650" y1="142" x2="740" y2="140" strokeWidth="4" opacity=".6" />
      </g>
    </svg>
  );
}

export default function LandingPage() {
  const popular = MODEL_ROUTES.filter((route) => route.entry.popular).slice(0, 5);

  return (
    <PublicShell>
      <section className="relative overflow-hidden">
        <div className="pinstripes pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-4 py-14 sm:px-6 lg:grid-cols-[1.25fr_0.85fr] lg:px-8 lg:py-16">
          <div>
            <p className="eyebrow mb-5">Intel for 300cc+ machines</p>
            <h1 className="text-balance text-5xl font-black leading-[0.98] tracking-[-0.035em] text-ink sm:text-6xl lg:text-7xl">
              Know your machine
              <br />
              <span className="text-leaf">cold.</span>
            </h1>
            <p className="mt-6 max-w-md text-pretty text-[17px] leading-relaxed text-road">
              Known faults, service intervals, and real repair costs — mapped by mileage, manufacturing
              batch, and RPM band. Free to browse.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="btn-dark px-6" href="/models">
                Decode my bike
              </Link>
              <Link className="btn-secondary px-6" href="/signup">
                Track my bike
              </Link>
            </div>
            <div className="mt-9 hidden sm:block">
              <MotorcycleArt />
            </div>
          </div>
          <div className="panel-dark self-start">
            <div
              className="pointer-events-none absolute -right-10 -top-10 h-[200px] w-[200px]"
              style={{ background: "radial-gradient(circle, rgba(124,58,237,.45), transparent 70%)" }}
              aria-hidden="true"
            />
            <div className="relative">
              <h2 className="text-[19px] font-extrabold tracking-tight">What goes wrong with mine?</h2>
              <p className="mb-5 mt-1 text-[13px] text-lav">Pick your motorcycle. Read its kundli — the issues written in its future.</p>
              <ModelPicker />
              <div className="mt-4 flex flex-wrap gap-2">
                {popular.map((route) => (
                  <Link
                    key={`${route.brandSlug}-${route.modelSlug}`}
                    href={`/models/${route.brandSlug}/${route.modelSlug}`}
                    className="rounded-full border border-bayline px-3 py-1.5 text-xs text-lav transition hover:border-leaf hover:text-white"
                  >
                    {route.model}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="border-t border-stone-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
          {features.map((feature) => (
            <div key={feature.title} className="border-t-[3px] border-leaf pt-4">
              <p className="eyebrow mb-2 text-[10.5px] tracking-[0.18em]">{feature.eyebrow}</p>
              <h3 className="font-extrabold text-ink">{feature.title}</h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-steel">{feature.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
