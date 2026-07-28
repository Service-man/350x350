import type { BlogPost } from "@/lib/types";

// Curated starter posts. These are the single source of truth for demo mode and
// the fallback a fresh production database shows until an admin publishes real
// posts. Body is sanitized HTML (the same shape the WYSIWYG editor produces).

const SEED_AT = "2026-07-14T00:00:00.000Z";

type SeedInput = Pick<BlogPost, "slug" | "title" | "excerpt" | "cover_emoji" | "tags" | "author_name" | "body_html"> & {
  published_at?: string;
};

function post(input: SeedInput, index: number): BlogPost {
  return {
    id: `seed-blog-${index + 1}`,
    status: "published",
    published_at: input.published_at ?? SEED_AT,
    created_at: input.published_at ?? SEED_AT,
    updated_at: input.published_at ?? SEED_AT,
    ...input
  };
}

export const SEED_BLOG_POSTS: BlogPost[] = [
  {
    slug: "e20-petrol-vs-traditional-what-350cc-riders-should-know",
    title: "E20 petrol vs traditional petrol: what 300cc+ riders should actually know",
    excerpt:
      "E20 is now the default at most Indian pumps. Here is a level-headed look at what 20% ethanol means for a modern 350cc+ motorcycle — mileage, materials, and what to watch — without the panic.",
    cover_emoji: "⛽",
    tags: ["Fuel", "E20", "Maintenance", "India"],
    author_name: "350x Garage",
    published_at: "2026-07-14T00:00:00.000Z",
    body_html: `
<p>If you have filled up recently, you have almost certainly run E20 — petrol blended with up to 20% ethanol. India hit its E20 rollout target ahead of schedule, and the standard pump nozzle now dispenses it by default. For the overwhelming majority of bikes in the 300cc+ segment, which run on petrol, this is the fuel you are living with. Here is what it actually changes, and what is just noise.</p>
<h2>What E20 is</h2>
<p>E20 is 80% petrol, 20% ethanol by volume. Ethanol is an alcohol with a lower energy content than petrol but a higher octane rating and a tendency to attract water. Those three properties explain almost everything a rider notices.</p>
<h2>The mileage question</h2>
<p>Because ethanol carries less energy per litre, a higher blend gives slightly fewer kilometres per litre — all else equal. On E20 versus straight petrol, expect a small, real drop, typically in the low single digits percentage-wise on a modern fuel-injected 350–650cc bike. It is usually smaller than the swing you would see from a headwind, a pillion, or a week of aggressive throttle. If your mileage falls off a cliff, ethanol is not your culprit — look at chain, tyres, air filter, or a dragging brake first.</p>
<h2>Materials: the part worth understanding</h2>
<p>Ethanol is mildly more aggressive toward certain rubbers, plastics, and uncoated metals than pure petrol, and it holds water more readily. On bikes designed and sold in the E20 era this is a non-issue — manufacturers moved to ethanol-compatible seals, lines, and coatings well before the rollout. The riders who should pay a little more attention:</p>
<ul>
<li><strong>Older carburettor bikes</strong> — pre-E10/E20 machines can see faster ageing of fuel lines, float-bowl seals, and diaphragms. These are cheap wear parts; replace with ethanol-rated versions at the next service if yours are original.</li>
<li><strong>Bikes that sit for weeks</strong> — ethanol-blended fuel absorbs moisture, and standing fuel can go stale and gummy faster. If your bike is a weekend machine or a seasonal tourer, this matters more than the blend ratio.</li>
</ul>
<h2>What to watch, practically</h2>
<ul>
<li><strong>Cold or rough starts after long standing</strong> — a symptom of stale, water-laden fuel rather than a fault. Ride it, do not let it sit half-full for months.</li>
<li><strong>A whiff of fuel or a weeping line</strong> on an older bike — inspect and replace perished rubber; do not wait.</li>
<li><strong>Storage</strong> — for a bike parked more than a month, top the tank up (less air, less condensation) rather than leaving it near-empty.</li>
</ul>
<h2>The honest bottom line</h2>
<p>For a current 300cc+ motorcycle, E20 is a small mileage trade-off and essentially a non-event for reliability. For an older or long-parked bike, the sensible moves are ordinary maintenance — fresh ethanol-rated fuel lines and not letting fuel go stale. Everything else is the same bike it was last week.</p>
<p><em>This is general ownership information for the Indian market, not OEM-certified advice. Always follow your manufacturer's fuel recommendation and service schedule.</em></p>
`.trim()
  },
  {
    slug: "the-5000-km-service-what-it-should-actually-cover",
    title: "The 5,000 km service: what it should actually cover",
    excerpt:
      "Walk into the service centre knowing what a proper first-interval service includes — so you can tell a thorough job from a quick oil-and-out.",
    cover_emoji: "🔧",
    tags: ["Service", "Checkpoints", "Maintenance"],
    author_name: "350x Garage",
    published_at: "2026-07-07T00:00:00.000Z",
    body_html: `
<p>The early-interval service sets the tone for a bike's life, and it is the one most riders hand over without knowing what "done" looks like. Here is the short version of what a thorough 5,000 km service on a 300cc+ bike should touch.</p>
<h2>The non-negotiables</h2>
<ul>
<li><strong>Engine oil and filter</strong> — the headline item. Confirm grade and that the filter was actually changed, not just topped up.</li>
<li><strong>Chain</strong> — clean, lube, and correct slack to spec. Stop-go city riding wears chains faster than the manual assumes.</li>
<li><strong>Brakes</strong> — pad thickness front and rear, lever feel, and fluid level.</li>
<li><strong>Throttle, clutch, and cables</strong> — free play set to spec so shifts and response stay crisp.</li>
</ul>
<h2>The easy-to-skip checks</h2>
<ul>
<li><strong>Tyre pressures</strong> — set cold, to the load you actually ride.</li>
<li><strong>Battery resting voltage</strong> — a 12.4V+ check catches accessory drain early.</li>
<li><strong>Fasteners</strong> — a torque check on the bits that vibrate loose (mirrors, pegs, guards) on a new bike.</li>
</ul>
<p>Ask for the checklist. A service centre that itemises what it did is a service centre worth returning to.</p>
<p><em>General guidance, not a substitute for your model's official service schedule.</em></p>
`.trim()
  }
].map((p, i) => post(p, i));

export function seedBlogPosts(): BlogPost[] {
  return [...SEED_BLOG_POSTS].sort(
    (a, b) => new Date(b.published_at ?? 0).getTime() - new Date(a.published_at ?? 0).getTime()
  );
}
