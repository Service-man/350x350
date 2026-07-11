import type { KnownIssue } from "../types";
import { issue, type KnownIssueSeed } from "./knownIssue";

// Canonical curated knowledge base. This TypeScript file is the single source
// of truth: `npm run seed:sql` regenerates supabase/migrations/005_seed_known_issues.sql
// from it, and demo mode / missing-env builds render it directly.
//
// Content policy: every row describes a pattern that riders commonly REPORT in
// public ownership discussions. Summaries are hedged ("riders report"), costs
// are rough Indian-market bands, and confidence is deliberately conservative.
// These are early indicators, not OEM-certified diagnostics.

const SEED_VERIFIED_AT = "2026-07-07T00:00:00.000Z";

export const SEED_KNOWN_ISSUES: KnownIssueSeed[] = [
  // ── Royal Enfield Classic 350 (J-series) ────────────────────────────────
  issue({
    brand: "Royal Enfield",
    model: "Classic 350",
    component: "Battery",
    issue_title: "Battery drain after accessory fitment",
    issue_summary:
      "Riders report weak starts or battery drain after auxiliary lights, louder horns, or phone chargers are wired without a relay and fused lines.",
    severity: "medium",
    mileage_band: "3,000-12,000 km",
    service_checkpoint_km: 5000,
    symptoms_to_watch: "Slow cranking after overnight parking, dimming aux lights at idle, repeated relay clicking",
    preventive_action: "Wire accessories through a relay with fused lines and ask for a resting-voltage check (12.4V+) at every service.",
    typical_cost_min: 800,
    typical_cost_max: 4500,
    mention_count: 34,
    trend_percentage: 12,
    confidence_level: "medium"
  }),
  issue({
    brand: "Royal Enfield",
    model: "Classic 350",
    component: "Chain/Sprocket",
    issue_title: "Chain slack and noise in stop-go city riding",
    issue_summary:
      "Chain noise and frequent adjustment needs show up around dense-traffic use and stretched lubrication intervals.",
    severity: "low",
    mileage_band: "4,000-10,000 km",
    service_checkpoint_km: 5000,
    symptoms_to_watch: "Clunk on throttle on/off, rattle over bumps, slack drifting past 25-30 mm",
    preventive_action: "Clean and lube the chain every 500-700 km in city use and keep slack within the manual's 25-30 mm window.",
    typical_cost_min: 300,
    typical_cost_max: 1200,
    mention_count: 26,
    trend_percentage: 6,
    confidence_level: "medium"
  }),
  issue({
    brand: "Royal Enfield",
    model: "Classic 350",
    component: "General Ownership",
    issue_title: "Mirror and footpeg buzz near highway cruising revs",
    issue_summary:
      "A busy patch around 4,000-5,500 rpm (roughly 90-100 km/h) is widely discussed; mirrors blur and pegs tingle on longer stints.",
    severity: "low",
    rpm_band: "4,000-5,500 rpm",
    symptoms_to_watch: "Blurred mirrors at highway speed, tingling pegs or bars after 30+ minutes",
    preventive_action: "Try bar-end weights, keep cruising just below the buzz band, and have engine-mount bolt torque checked at service.",
    typical_cost_min: 0,
    typical_cost_max: 1500,
    mention_count: 41,
    trend_percentage: 9,
    confidence_level: "medium"
  }),
  issue({
    brand: "Royal Enfield",
    model: "Classic 350",
    component: "Clutch",
    issue_title: "Clutch drag and hard first-gear shifts in traffic",
    issue_summary:
      "Some owners log notchy first-gear engagement and a heavy lever feel in long commutes, easing after cable adjustment and fresh oil.",
    severity: "medium",
    mileage_band: "8,000-15,000 km",
    service_checkpoint_km: 10000,
    symptoms_to_watch: "False neutrals, clunky first-gear engagement, lever effort rising in jams",
    preventive_action: "Adjust cable free play, lube the lever pivot, and stick to the manual's oil grade and change interval.",
    typical_cost_min: 300,
    typical_cost_max: 2500,
    mention_count: 18,
    trend_percentage: 5,
    confidence_level: "medium"
  }),
  issue({
    brand: "Royal Enfield",
    model: "Classic 350",
    component: "Brake Pads",
    issue_title: "Front disc squeal and early pad glazing in city use",
    issue_summary:
      "Squeal under light braking and glazed pads are commonly reported from brake-dragging city commutes.",
    severity: "medium",
    mileage_band: "8,000-15,000 km",
    service_checkpoint_km: 10000,
    symptoms_to_watch: "Squeal at low-speed braking, longer stopping distances, scoring lines on the disc",
    preventive_action: "Inspect pads at every service, avoid resting a finger on the lever in traffic, and keep caliper pins clean.",
    typical_cost_min: 600,
    typical_cost_max: 6000,
    mention_count: 22,
    trend_percentage: 7,
    confidence_level: "medium"
  }),
  issue({
    brand: "Royal Enfield",
    model: "Classic 350",
    component: "Electrical",
    issue_title: "Instrument cluster condensation on early J-series",
    issue_summary:
      "Owners of early J-platform builds report fogging inside the speedometer glass after rain or washing; dealers have resealed or replaced clusters.",
    severity: "low",
    mfg_year_start: 2021,
    mfg_year_end: 2022,
    mileage_band: "0-15,000 km",
    symptoms_to_watch: "Mist inside the cluster glass after rain, erratic fuel-bar readings",
    preventive_action: "Park covered in monsoon, avoid pressure-washing the console, and push for a warranty reseal if fogging persists.",
    typical_cost_min: 0,
    typical_cost_max: 3500,
    mention_count: 15,
    trend_percentage: 4,
    confidence_level: "low"
  }),
  issue({
    brand: "Royal Enfield",
    model: "Classic 350",
    component: "Engine/Cooling",
    issue_title: "Minor oil weep near head joints reported on early builds",
    issue_summary:
      "A small number of early-build owners report an oil film near head or rocker joints; usually a torque or gasket fix.",
    severity: "low",
    mfg_year_start: 2021,
    mfg_year_end: 2022,
    mileage_band: "5,000-20,000 km",
    symptoms_to_watch: "Oil film on cooling fins near the head, a drop or two under the bike after long rides",
    preventive_action: "Monitor oil level between services and ask the dealer for a torque/gasket check if a weep line appears.",
    typical_cost_min: 500,
    typical_cost_max: 3000,
    mention_count: 12,
    trend_percentage: 3,
    confidence_level: "low"
  }),
  issue({
    brand: "Royal Enfield",
    model: "Classic 350",
    component: "Tyres",
    issue_title: "Tube-type wheels turn punctures into roadside jobs",
    issue_summary:
      "Spoke rims with tubes mean a puncture usually needs the wheel off and a tube swap rather than a quick plug, a frequent touring complaint.",
    severity: "low",
    mileage_band: "Any",
    symptoms_to_watch: "Sudden full deflation instead of a slow leak, repeated punctures on worn tubes",
    preventive_action: "Carry a spare tube and levers on tours, check spoke tension at services, and replace aged tubes with quality ones.",
    typical_cost_min: 300,
    typical_cost_max: 1500,
    mention_count: 20,
    trend_percentage: 5,
    confidence_level: "medium"
  }),
  issue({
    brand: "Royal Enfield",
    model: "Classic 350",
    component: "General Ownership",
    issue_title: "First service at 500 km sets the wear baseline",
    issue_summary:
      "The 500 km first service (oil change, bolt torque, chain setup) is the checkpoint that owners consistently say determines how the engine settles.",
    severity: "low",
    mileage_band: "0-500 km",
    service_checkpoint_km: 500,
    symptoms_to_watch: "Metal-flecked first oil is normal; skipping the change is the real risk",
    preventive_action: "Do the 500 km oil change on time, keep the bill, and get chain slack plus bolt torque checked.",
    typical_cost_min: 600,
    typical_cost_max: 1500,
    mention_count: 10,
    trend_percentage: 0,
    confidence_level: "high"
  }),

  // ── Royal Enfield Meteor 350 ────────────────────────────────────────────
  issue({
    brand: "Royal Enfield",
    model: "Meteor 350",
    component: "Electrical",
    issue_title: "Tripper pod and cluster glitches on early batches",
    issue_summary:
      "Early Meteor owners report the Tripper navigation pod going blank or rebooting and occasional battery-warning flickers, often fixed by connector or firmware attention.",
    severity: "medium",
    mfg_year_start: 2021,
    mfg_year_end: 2022,
    mileage_band: "5,000-15,000 km",
    symptoms_to_watch: "Blank or rebooting Tripper pod, battery icon flicker, Bluetooth drops",
    preventive_action: "Get connectors and firmware checked at the dealer and keep battery terminals clean and tight.",
    typical_cost_min: 0,
    typical_cost_max: 2500,
    mention_count: 19,
    trend_percentage: 5,
    confidence_level: "low"
  }),
  issue({
    brand: "Royal Enfield",
    model: "Meteor 350",
    component: "General Ownership",
    issue_title: "Handlebar buzz at sustained 100+ km/h",
    issue_summary:
      "The Meteor cruises calmly below 100 km/h; above that riders report palm tingle and mirror blur on long highway stints.",
    severity: "low",
    rpm_band: "4,500-5,500 rpm",
    symptoms_to_watch: "Mirror blur past 100 km/h, numb palms after long stretches",
    preventive_action: "Use OEM bar-end weights or cushioned grips and cruise a notch below the buzz band on long days.",
    typical_cost_min: 0,
    typical_cost_max: 1200,
    mention_count: 17,
    trend_percentage: 4,
    confidence_level: "medium"
  }),
  issue({
    brand: "Royal Enfield",
    model: "Meteor 350",
    component: "Chain/Sprocket",
    issue_title: "Chain runs dry on highway tours",
    issue_summary:
      "Touring owners report chain whine and accelerated wear when lubrication intervals stretch across long highway days.",
    severity: "low",
    mileage_band: "5,000-15,000 km",
    service_checkpoint_km: 10000,
    symptoms_to_watch: "Dry or shiny links, whine at steady speed, tight spots when rotating the wheel",
    preventive_action: "Lube every 500 km on tours (more often in rain) and check slack before multi-day rides.",
    typical_cost_min: 300,
    typical_cost_max: 900,
    mention_count: 14,
    trend_percentage: 3,
    confidence_level: "medium"
  }),
  issue({
    brand: "Royal Enfield",
    model: "Meteor 350",
    component: "Battery",
    issue_title: "Battery discharge when the bike sits for weeks",
    issue_summary:
      "Weekend-only riders report weak cranking after the Meteor sits 1-2 weeks, especially with the Tripper pod and accessories drawing standby current.",
    severity: "low",
    mileage_band: "0-10,000 km",
    service_checkpoint_km: 5000,
    symptoms_to_watch: "Sluggish first crank after a parked spell, clock/trip resets",
    preventive_action: "Ride at least weekly or use a trickle charger; get the battery load-tested at the 5,000 km service.",
    typical_cost_min: 0,
    typical_cost_max: 4500,
    mention_count: 16,
    trend_percentage: 4,
    confidence_level: "medium"
  }),
  issue({
    brand: "Royal Enfield",
    model: "Meteor 350",
    component: "General Ownership",
    issue_title: "Stock seat comfort fades on 150+ km days",
    issue_summary:
      "A common long-ride note: the rider perch feels great for an hour, then numbness sets in on full-day tours; many switch to touring seats.",
    severity: "low",
    mileage_band: "Any",
    symptoms_to_watch: "Numbness or hotspots after 150+ km stints, frequent standing on pegs",
    preventive_action: "Plan a stop every 100-120 km or budget for a touring/gel seat if you ride long distances often.",
    typical_cost_min: 0,
    typical_cost_max: 6000,
    mention_count: 13,
    trend_percentage: 2,
    confidence_level: "low"
  }),

  // ── Royal Enfield Hunter 350 ────────────────────────────────────────────
  issue({
    brand: "Royal Enfield",
    model: "Hunter 350",
    component: "Suspension",
    issue_title: "Stiff rear shocks over broken roads",
    issue_summary:
      "The most repeated Hunter complaint: a firm rear setup that kicks over potholes and broken urban roads, especially riding solo.",
    severity: "medium",
    mileage_band: "0-8,000 km",
    service_checkpoint_km: 5000,
    symptoms_to_watch: "Sharp kicks to the lower back on potholes, rear skipping over broken patches",
    preventive_action: "Set preload to the softest step for solo riding and correct tyre pressures; consider quality aftermarket shocks if it still hurts.",
    typical_cost_min: 0,
    typical_cost_max: 9000,
    mention_count: 44,
    trend_percentage: 8,
    confidence_level: "medium"
  }),
  issue({
    brand: "Royal Enfield",
    model: "Hunter 350",
    component: "General Ownership",
    issue_title: "Footpeg buzz when held around 5,000 rpm",
    issue_summary:
      "Riders report peg tingle when the engine sits near 5,000 rpm for long stretches; below that the J-series engine stays calm.",
    severity: "low",
    rpm_band: "4,500-5,500 rpm",
    symptoms_to_watch: "Tingling pegs on sustained highway runs, mirror shimmer near the band",
    preventive_action: "Short-shift to keep revs near 4,000 rpm when cruising and have mount bolts checked if buzz suddenly worsens.",
    typical_cost_min: 0,
    typical_cost_max: 800,
    mention_count: 12,
    trend_percentage: 3,
    confidence_level: "low"
  }),
  issue({
    brand: "Royal Enfield",
    model: "Hunter 350",
    component: "Chain/Sprocket",
    issue_title: "Chain grinding feel after monsoon city rides",
    issue_summary:
      "Wet-season commuters report a gritty chain feel and surface rust specks when washing and lubing lag behind rain riding.",
    severity: "low",
    mileage_band: "3,000-9,000 km",
    service_checkpoint_km: 5000,
    symptoms_to_watch: "Gritty feel through pegs at low speed, rust specks on links, squeak after rain",
    preventive_action: "Rinse and re-lube the chain after sustained rain riding and keep slack in spec through the monsoon.",
    typical_cost_min: 300,
    typical_cost_max: 1000,
    mention_count: 15,
    trend_percentage: 4,
    confidence_level: "medium"
  }),
  issue({
    brand: "Royal Enfield",
    model: "Hunter 350",
    component: "Electrical",
    issue_title: "Horn and switchgear niggles on early batches",
    issue_summary:
      "Some 2022-2023 build owners report weak or intermittent horns and inconsistent switch feel, usually sorted by dealer contact-cleaning or replacement.",
    severity: "low",
    mfg_year_start: 2022,
    mfg_year_end: 2023,
    mileage_band: "0-10,000 km",
    symptoms_to_watch: "Horn cutting out or sounding weak, switches needing a double press",
    preventive_action: "Have contacts cleaned/greased at service and log occurrences for a warranty swap if they repeat.",
    typical_cost_min: 0,
    typical_cost_max: 1200,
    mention_count: 11,
    trend_percentage: 2,
    confidence_level: "low"
  }),
  issue({
    brand: "Royal Enfield",
    model: "Hunter 350",
    component: "Tyres",
    issue_title: "Rear tyre squares off by 12-15k in city use",
    issue_summary:
      "City-heavy Hunters commonly show a squared rear profile around 12,000-15,000 km, making tip-in feel vague before the tread is legally done.",
    severity: "low",
    mileage_band: "10,000-15,000 km",
    service_checkpoint_km: 15000,
    symptoms_to_watch: "Flat centre band on the rear tyre, reluctance to lean, vague mid-corner feel",
    preventive_action: "Keep pressures in spec, mix in open-road riding, and budget for a rear tyre around the 15,000 km checkpoint.",
    typical_cost_min: 3000,
    typical_cost_max: 5500,
    mention_count: 13,
    trend_percentage: 4,
    confidence_level: "medium"
  }),

  // ── Royal Enfield Himalayan 450 ─────────────────────────────────────────
  issue({
    brand: "Royal Enfield",
    model: "Himalayan 450",
    component: "Engine/Cooling",
    issue_title: "Heat and long fan cycles in slow traffic",
    issue_summary:
      "The liquid-cooled Sherpa engine runs warm in crawling traffic; riders report high temperature bars, a hot right thigh, and the fan running long at idle.",
    severity: "medium",
    mileage_band: "0-10,000 km",
    service_checkpoint_km: 5000,
    symptoms_to_watch: "Temperature bars climbing in jams, fan running continuously at idle, heat on the right thigh",
    preventive_action: "Check coolant level at services, keep radiator fins clean (especially after off-road), and avoid long idling in jams.",
    typical_cost_min: 0,
    typical_cost_max: 1500,
    mention_count: 38,
    trend_percentage: 10,
    confidence_level: "medium"
  }),
  issue({
    brand: "Royal Enfield",
    model: "Himalayan 450",
    component: "Electrical",
    issue_title: "Early-production sensor and electrical niggles",
    issue_summary:
      "Some first-batch owners report spurious warning lights and side-stand sensor cutoffs; dealers have addressed these with connector and software updates.",
    severity: "medium",
    mfg_year_start: 2023,
    mfg_year_end: 2024,
    mileage_band: "0-8,000 km",
    symptoms_to_watch: "Random warning lights, engine cutting when shifting to first with the stand up",
    preventive_action: "Get dealer software/connector updates applied and log each occurrence with date and odometer for warranty follow-up.",
    typical_cost_min: 0,
    typical_cost_max: 2000,
    mention_count: 16,
    trend_percentage: 5,
    confidence_level: "low"
  }),
  issue({
    brand: "Royal Enfield",
    model: "Himalayan 450",
    component: "Clutch",
    issue_title: "Notchy cold shifts when new, improving after first service",
    issue_summary:
      "Owners commonly note clunky 1-2 shifts and a notchy cold gearbox in the first few hundred kilometres, settling after the first oil change.",
    severity: "low",
    mileage_band: "0-3,000 km",
    service_checkpoint_km: 500,
    symptoms_to_watch: "Clunky first-to-second shifts cold, occasional false neutral in the first weeks",
    preventive_action: "Do the first service oil change on schedule and have clutch lever free play set; re-check at 3,000 km if it persists.",
    typical_cost_min: 600,
    typical_cost_max: 1500,
    mention_count: 14,
    trend_percentage: 3,
    confidence_level: "medium"
  }),
  issue({
    brand: "Royal Enfield",
    model: "Himalayan 450",
    component: "Chain/Sprocket",
    issue_title: "Off-road use shortens chain life sharply",
    issue_summary:
      "Dust and water crossings accelerate chain wear; trail-riding owners report tight spots and kinked links well before typical road-use life.",
    severity: "low",
    mileage_band: "8,000-18,000 km",
    service_checkpoint_km: 10000,
    symptoms_to_watch: "Tight spots when spinning the rear wheel, kinked links after trail rides, fast slack growth",
    preventive_action: "Clean and lube after every dusty or wet ride (300-500 km intervals off-road) and inspect sprocket teeth at 10,000 km.",
    typical_cost_min: 400,
    typical_cost_max: 4500,
    mention_count: 12,
    trend_percentage: 4,
    confidence_level: "medium"
  }),
  issue({
    brand: "Royal Enfield",
    model: "Himalayan 450",
    component: "General Ownership",
    issue_title: "Windscreen and cowl buzz near 5,500 rpm",
    issue_summary:
      "A rattle from the screen/cowl area around 5,000-6,000 rpm is a recurring minor complaint, usually fixed with fastener checks or foam tape.",
    severity: "low",
    rpm_band: "5,000-6,000 rpm",
    symptoms_to_watch: "Audible rattle from the front cowl at specific revs, loose screen fasteners",
    preventive_action: "Check screen fasteners at service and add thin foam tape at contact points if the rattle returns.",
    typical_cost_min: 0,
    typical_cost_max: 500,
    mention_count: 10,
    trend_percentage: 2,
    confidence_level: "low"
  }),
  issue({
    brand: "Royal Enfield",
    model: "Himalayan 450",
    component: "Tyres",
    issue_title: "Stock dual-purpose tyres wear fast on tarmac touring",
    issue_summary:
      "Owners who tour mostly on tarmac report the stock dual-purpose tyres squaring and losing wet grip earlier than road-biased rubber would.",
    severity: "low",
    mileage_band: "10,000-18,000 km",
    service_checkpoint_km: 15000,
    symptoms_to_watch: "Centre wear on the rear, reduced wet-road confidence, block squirm on highways",
    preventive_action: "Run load-correct pressures and plan tyre replacement around 15,000 km if your use is mostly road touring.",
    typical_cost_min: 8000,
    typical_cost_max: 14000,
    mention_count: 11,
    trend_percentage: 3,
    confidence_level: "medium"
  }),

  // ── Honda CB350 ─────────────────────────────────────────────────────────
  issue({
    brand: "Honda",
    model: "CB350",
    component: "Chain/Sprocket",
    issue_title: "Chain noise and early adjustment need",
    issue_summary:
      "Riders log chain lash and adjustment needs earlier than expected, particularly in city use and monsoon months.",
    severity: "low",
    mileage_band: "3,000-9,000 km",
    service_checkpoint_km: 5000,
    symptoms_to_watch: "Lash on throttle on/off transitions, clatter over bumps, frequent slack resets",
    preventive_action: "Lube on Honda's specified interval, keep slack in spec, and clean after rain riding.",
    typical_cost_min: 300,
    typical_cost_max: 1000,
    mention_count: 23,
    trend_percentage: 7,
    confidence_level: "medium"
  }),
  issue({
    brand: "Honda",
    model: "CB350",
    component: "Battery",
    issue_title: "Battery run-down with short-trip-only use",
    issue_summary:
      "Short daily hops without longer runs leave some CB350 batteries undercharged, showing up as sluggish winter-morning starts.",
    severity: "low",
    mileage_band: "0-12,000 km",
    service_checkpoint_km: 10000,
    symptoms_to_watch: "Sluggish cranking on cold mornings, weak horn at idle after short-trip weeks",
    preventive_action: "Take a 30+ minute ride weekly or use a trickle charger; have charging voltage verified at service.",
    typical_cost_min: 0,
    typical_cost_max: 5200,
    mention_count: 12,
    trend_percentage: 3,
    confidence_level: "medium"
  }),
  issue({
    brand: "Honda",
    model: "CB350",
    component: "Brake Pads",
    issue_title: "Rear brake squeal reports",
    issue_summary:
      "A minor but recurring note: rear brake squeal under light application, typically cleared by cleaning and deglazing at service.",
    severity: "low",
    mileage_band: "5,000-12,000 km",
    service_checkpoint_km: 10000,
    symptoms_to_watch: "Squeal on light rear-brake application, dust caking around the caliper",
    preventive_action: "Ask for pad deglaze and caliper cleaning at service; replace pads if squeal persists with low pad depth.",
    typical_cost_min: 400,
    typical_cost_max: 1500,
    mention_count: 10,
    trend_percentage: 2,
    confidence_level: "low"
  }),
  issue({
    brand: "Honda",
    model: "CB350",
    component: "General Ownership",
    issue_title: "BigWing network is sparser than mass-market brands",
    issue_summary:
      "Ownership threads consistently flag longer distances to BigWing service points and occasional parts wait times outside metros.",
    severity: "low",
    mileage_band: "Any",
    symptoms_to_watch: "Long lead times for body panels or special-order parts, service centre 50+ km away",
    preventive_action: "Plan services ahead, stock consumables (oil filter, pads) for your interval, and confirm parts before booking a slot.",
    typical_cost_min: null,
    typical_cost_max: null,
    mention_count: 18,
    trend_percentage: 5,
    confidence_level: "medium"
  }),
  issue({
    brand: "Honda",
    model: "CB350",
    component: "Electrical",
    issue_title: "Fuel gauge fluctuation on early units",
    issue_summary:
      "A small set of early owners report fuel-bar readings jumping on slopes or after refuelling; dealers check the float and connections.",
    severity: "low",
    mfg_year_start: 2021,
    mfg_year_end: 2022,
    mileage_band: "0-10,000 km",
    symptoms_to_watch: "Fuel bars jumping between readings, full-tank not showing full",
    preventive_action: "Track range by trip meter and have the float/sender checked under warranty if readings stay erratic.",
    typical_cost_min: 0,
    typical_cost_max: 1500,
    mention_count: 9,
    trend_percentage: 2,
    confidence_level: "low"
  }),

  // ── KTM Duke 390 ────────────────────────────────────────────────────────
  issue({
    brand: "KTM",
    model: "Duke 390",
    component: "Engine/Cooling",
    issue_title: "Radiator fan cycles frequently in dense traffic",
    issue_summary:
      "Fan cycling and fast-climbing temperature readings in crawling traffic are the most common Duke 390 city observations; largely normal but worth monitoring.",
    severity: "medium",
    mileage_band: "0-20,000 km",
    service_checkpoint_km: 5000,
    symptoms_to_watch: "Fan toggling on/off repeatedly in jams, temperature warnings on hot days, coolant smell after shutdown",
    preventive_action: "Keep coolant topped to spec, get the radiator cleaned yearly, and avoid extended idling in gridlock.",
    typical_cost_min: 0,
    typical_cost_max: 2000,
    mention_count: 35,
    trend_percentage: 4,
    confidence_level: "medium"
  }),
  issue({
    brand: "KTM",
    model: "Duke 390",
    component: "Chain/Sprocket",
    issue_title: "Chain-sprocket kit wears by 18-25k with spirited riding",
    issue_summary:
      "Hard-ridden Dukes commonly need a full chain-sprocket kit between 18,000-25,000 km; adjusters near the end of travel are the giveaway.",
    severity: "medium",
    mileage_band: "15,000-25,000 km",
    service_checkpoint_km: 20000,
    symptoms_to_watch: "Adjuster marks near the end, hooked sprocket teeth, tight spots and lash together",
    preventive_action: "Lube every 500 km, avoid pressure-washing the chain, and budget for a kit around the 20,000 km checkpoint.",
    typical_cost_min: 4500,
    typical_cost_max: 9000,
    mention_count: 21,
    trend_percentage: 5,
    confidence_level: "medium"
  }),
  issue({
    brand: "KTM",
    model: "Duke 390",
    component: "Brake Pads",
    issue_title: "Fast pad wear with aggressive city riding",
    issue_summary:
      "Strong brakes plus aggressive use equals pads done by 6,000-12,000 km in many city-riding reports.",
    severity: "medium",
    mileage_band: "6,000-12,000 km",
    service_checkpoint_km: 10000,
    symptoms_to_watch: "Growing lever travel, heavy black dust on the front wheel, metallic scrape when worn out",
    preventive_action: "Inspect pads every 3,000 km, fit quality pads, and bed them properly after replacement.",
    typical_cost_min: 1200,
    typical_cost_max: 3200,
    mention_count: 19,
    trend_percentage: 4,
    confidence_level: "medium"
  }),
  issue({
    brand: "KTM",
    model: "Duke 390",
    component: "Electrical",
    issue_title: "TFT display fogging on early display-equipped gen",
    issue_summary:
      "2017-2019 Dukes with the first TFT dash have known condensation reports after rain; many were replaced under warranty.",
    severity: "low",
    mfg_year_start: 2017,
    mfg_year_end: 2019,
    mileage_band: "0-15,000 km",
    symptoms_to_watch: "Condensation inside the TFT after rain or washing, display spots that fade as it dries",
    preventive_action: "Park covered in monsoon and pursue warranty replacement early; out-of-warranty displays are expensive.",
    typical_cost_min: 0,
    typical_cost_max: 8000,
    mention_count: 14,
    trend_percentage: 2,
    confidence_level: "low"
  }),
  issue({
    brand: "KTM",
    model: "Duke 390",
    component: "Electrical",
    issue_title: "Regulator-rectifier failures on older generation",
    issue_summary:
      "The 2013-2016 generation has a well-documented pattern of regulator/rectifier failures: batteries draining while riding and no-starts after highway runs.",
    severity: "high",
    mfg_year_start: 2013,
    mfg_year_end: 2016,
    mileage_band: "10,000-30,000 km",
    symptoms_to_watch: "Battery draining while riding, flickering headlight, no-start right after a long highway run",
    preventive_action: "Verify charging voltage (13.8-14.4V at 5,000 rpm) at services and fit an upgraded reg/rec if the original fails.",
    typical_cost_min: 2500,
    typical_cost_max: 6000,
    mention_count: 27,
    trend_percentage: 3,
    confidence_level: "medium"
  }),
  issue({
    brand: "KTM",
    model: "Duke 390",
    component: "Clutch",
    issue_title: "Clutch slip after sustained hard launches",
    issue_summary:
      "Track-day and drag-happy owners report clutch slip past 15,000 km: revs rise without matching speed in higher gears.",
    severity: "medium",
    mileage_band: "15,000-30,000 km",
    service_checkpoint_km: 20000,
    symptoms_to_watch: "RPM flare without acceleration in 4th-6th, burnt smell after hard runs",
    preventive_action: "Use JASO MA2 oil only, keep free play in spec, and inspect plates at 20,000 km if you ride hard.",
    typical_cost_min: 3000,
    typical_cost_max: 8000,
    mention_count: 12,
    trend_percentage: 3,
    confidence_level: "medium"
  }),
  issue({
    brand: "KTM",
    model: "Duke 390",
    component: "General Ownership",
    issue_title: "Tank and seat buzz in the 7-8k rpm band",
    issue_summary:
      "A high-frequency buzz through the tank and seat around 7,000-8,500 rpm is widely reported as engine character on long highway pulls.",
    severity: "low",
    rpm_band: "7,000-8,500 rpm",
    symptoms_to_watch: "Numb inner thighs on long highway stints, buzzy pegs near the band",
    preventive_action: "Treat mild buzz as character, but get engine mounts checked if it appears suddenly or worsens.",
    typical_cost_min: 0,
    typical_cost_max: 500,
    mention_count: 13,
    trend_percentage: 2,
    confidence_level: "low"
  }),

  // ── Triumph Speed 400 ───────────────────────────────────────────────────
  issue({
    brand: "Triumph",
    model: "Speed 400",
    component: "General Ownership",
    issue_title: "First-service cost varies widely across cities",
    issue_summary:
      "Owners comparing bills report the 500-1,000 km first service quoted differently across dealers and cities, creating spend uncertainty.",
    severity: "low",
    mileage_band: "500-2,000 km",
    service_checkpoint_km: 500,
    symptoms_to_watch: "Quotes differing by thousands between dealers, unlisted add-ons on the estimate",
    preventive_action: "Ask for an itemized estimate before work starts and keep bills to benchmark against other owners.",
    typical_cost_min: 2000,
    typical_cost_max: 4500,
    mention_count: 20,
    trend_percentage: 14,
    confidence_level: "medium"
  }),
  issue({
    brand: "Triumph",
    model: "Speed 400",
    component: "Engine/Cooling",
    issue_title: "Right-side heat from the exhaust in slow traffic",
    issue_summary:
      "Riders report noticeable warmth on the right calf from the downpipe/cat area in crawling summer traffic; expected behaviour unless severe.",
    severity: "low",
    mileage_band: "0-8,000 km",
    service_checkpoint_km: 5000,
    symptoms_to_watch: "Warm right calf in jams, heat shimmer off the downpipe at idle",
    preventive_action: "Wear riding pants in summer traffic; have the dealer inspect if heat feels extreme or comes with a coolant warning.",
    typical_cost_min: 0,
    typical_cost_max: 500,
    mention_count: 15,
    trend_percentage: 4,
    confidence_level: "low"
  }),
  issue({
    brand: "Triumph",
    model: "Speed 400",
    component: "Chain/Sprocket",
    issue_title: "New-chain stretch needs an early adjustment",
    issue_summary:
      "Multiple owners report chain slack growing quickly in the first 1,000-3,000 km as the new chain beds in, then stabilising.",
    severity: "low",
    mileage_band: "500-3,000 km",
    service_checkpoint_km: 3000,
    symptoms_to_watch: "Slack audibly growing in the first weeks, light lash on throttle transitions",
    preventive_action: "Check slack at 1,000 km rather than waiting for the service interval; it settles after the initial stretch.",
    typical_cost_min: 200,
    typical_cost_max: 600,
    mention_count: 13,
    trend_percentage: 3,
    confidence_level: "medium"
  }),
  issue({
    brand: "Triumph",
    model: "Speed 400",
    component: "Electrical",
    issue_title: "Minor switchgear and sensor niggles on launch batch",
    issue_summary:
      "Early 2023-2024 units have scattered reports of switch feel issues and occasional warning lights, typically resolved with dealer updates.",
    severity: "low",
    mfg_year_start: 2023,
    mfg_year_end: 2024,
    mileage_band: "0-8,000 km",
    symptoms_to_watch: "Occasional spurious warning light, switches needing a firm press",
    preventive_action: "Apply dealer software updates and document each occurrence with date/odometer for warranty traction.",
    typical_cost_min: 0,
    typical_cost_max: 1500,
    mention_count: 12,
    trend_percentage: 3,
    confidence_level: "low"
  }),
  issue({
    brand: "Triumph",
    model: "Speed 400",
    component: "Suspension",
    issue_title: "Front fork feels soft for heavier riders",
    issue_summary:
      "Riders above ~90 kg report noticeable front dive under hard braking and a soft feel two-up; lighter riders rarely mention it.",
    severity: "low",
    mileage_band: "0-10,000 km",
    symptoms_to_watch: "Pronounced nose dive under hard braking, front wallowing two-up",
    preventive_action: "Try firmer damping via heavier fork oil at a competent workshop if dive bothers you; ride within limits meanwhile.",
    typical_cost_min: 0,
    typical_cost_max: 3000,
    mention_count: 9,
    trend_percentage: 2,
    confidence_level: "low"
  })
];

// Demo/public fallback: seed rows shaped as full KnownIssue records so pages
// can render them without a database (missing envs / demo mode).
export function seedAsKnownIssueRows(): KnownIssue[] {
  return SEED_KNOWN_ISSUES.map((seed, index) => ({
    ...seed,
    id: `seed-${index + 1}`,
    last_verified_at: SEED_VERIFIED_AT,
    created_at: SEED_VERIFIED_AT,
    updated_at: SEED_VERIFIED_AT
  })).sort((a, b) => b.mention_count - a.mention_count);
}
