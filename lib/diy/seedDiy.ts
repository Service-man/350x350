import type { DiyGuide } from "@/lib/types";

// Starter DIY guides: source of truth for demo mode and the fallback a fresh
// production database shows until an admin curates real ones. Product links use
// neutral Amazon India search URLs as placeholders — an admin replaces each with
// the exact affiliate product link (with the Associates tag) from /admin_con.

const SEED_AT = "2026-07-10T00:00:00.000Z";

export const SEED_DIY_GUIDES: DiyGuide[] = [
  {
    id: "seed-diy-1",
    slug: "clean-and-lube-your-chain",
    title: "Clean and lube your chain the right way",
    summary:
      "A 20-minute job that quietly extends chain, sprocket, and mileage life — and prevents the stop-go city slack most 300cc+ riders hit around 4,000–10,000 km.",
    brand: null,
    model: null,
    component: "Chain/Sprocket",
    difficulty: "easy",
    estimated_time: "20–30 min",
    status: "published",
    published_at: SEED_AT,
    created_at: SEED_AT,
    updated_at: SEED_AT,
    steps: [
      { title: "Put the bike on a paddock stand", detail: "You need the rear wheel free to spin. A paddock stand or centre stand makes this safe and quick." },
      { title: "Spray on chain cleaner and brush", detail: "Work a grunge brush around the links as you rotate the wheel. Wipe off the black residue with a rag." },
      { title: "Let it dry, then lube", detail: "Apply chain lube to the inner face of the chain while slowly turning the wheel, covering the full loop. Wipe the excess." },
      { title: "Check slack", detail: "Set chain slack to your model's spec (usually 20–30 mm free play). Too tight stresses bearings; too loose risks skipping." }
    ],
    products: [
      { id: "seed-diy-1-p1", guide_id: "seed-diy-1", title: "Chain cleaner spray", description: "Degreaser formulated for O-ring chains.", amazon_url: "https://www.amazon.in/s?k=motorcycle+chain+cleaner", approx_price: "₹350–₹600", position: 0, created_at: SEED_AT, updated_at: SEED_AT },
      { id: "seed-diy-1-p2", guide_id: "seed-diy-1", title: "Chain lube (O-ring safe)", description: "Look for one rated for O/X-ring chains.", amazon_url: "https://www.amazon.in/s?k=chain+lube+o+ring", approx_price: "₹400–₹800", position: 1, created_at: SEED_AT, updated_at: SEED_AT },
      { id: "seed-diy-1-p3", guide_id: "seed-diy-1", title: "Grunge brush", description: "Three-sided brush that cleans all faces at once.", amazon_url: "https://www.amazon.in/s?k=chain+grunge+brush", approx_price: "₹250–₹500", position: 2, created_at: SEED_AT, updated_at: SEED_AT }
    ]
  },
  {
    id: "seed-diy-2",
    slug: "battery-health-and-accessory-wiring-check",
    title: "Battery health & accessory wiring check",
    summary:
      "Weak starts after accessories are one of the most-reported issues on 350cc bikes. A multimeter and 15 minutes tells you whether it's the battery or the wiring.",
    brand: null,
    model: null,
    component: "Battery",
    difficulty: "easy",
    estimated_time: "15 min",
    status: "published",
    published_at: SEED_AT,
    created_at: SEED_AT,
    updated_at: SEED_AT,
    steps: [
      { title: "Measure resting voltage", detail: "With the bike off and untouched for a few hours, a healthy battery reads 12.4–12.7V across the terminals." },
      { title: "Check charging voltage", detail: "Start the bike and rev to ~3,000 rpm. You should see roughly 13.5–14.5V — lower means a charging-system issue, not just the battery." },
      { title: "Inspect accessory taps", detail: "Auxiliary lights, chargers, and horns wired straight to the battery without a relay and fuse are the usual drain culprits. Re-route through a fused relay." },
      { title: "Clean and torque terminals", detail: "Corroded or loose terminals mimic a dead battery. Clean, reseat, and snug them up." }
    ],
    products: [
      { id: "seed-diy-2-p1", guide_id: "seed-diy-2", title: "Digital multimeter", description: "Any basic auto-ranging DC multimeter works.", amazon_url: "https://www.amazon.in/s?k=digital+multimeter", approx_price: "₹500–₹1,200", position: 0, created_at: SEED_AT, updated_at: SEED_AT },
      { id: "seed-diy-2-p2", guide_id: "seed-diy-2", title: "Fused relay wiring kit", description: "For wiring accessories the safe way.", amazon_url: "https://www.amazon.in/s?k=motorcycle+relay+fuse+wiring+kit", approx_price: "₹400–₹900", position: 1, created_at: SEED_AT, updated_at: SEED_AT }
    ]
  }
];

export function seedDiyGuides(): DiyGuide[] {
  return [...SEED_DIY_GUIDES].sort(
    (a, b) => new Date(b.published_at ?? 0).getTime() - new Date(a.published_at ?? 0).getTime()
  );
}
