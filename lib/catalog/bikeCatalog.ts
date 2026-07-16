import type { BikeBodyType, BikeCatalogEntry } from "@/lib/types";

// Canonical catalogue of premium (~300cc and above) motorcycles sold in India,
// the single source of truth for the model picker, /models, and the library.
// `npm run seed:sql` regenerates supabase/migrations/007_seed_bike_catalog.sql
// from this file, and demo/no-env builds render it directly.
//
// Data is factual public catalogue info (brand, model, engine cc, body type,
// years, retail network). Engine capacities are the India-spec figures for the
// current generation. Scope: the 300cc+ premium segment these brands compete
// in — comprehensive through the mid-capacity range plus each brand's popular
// bigger models. Ultra-niche 1200cc+ tourer trims can be added on request.

type CatalogSeed = Omit<BikeCatalogEntry, "id" | "created_at" | "updated_at">;

function bike(
  brand: string,
  model: string,
  engine_cc: number,
  body_type: BikeBodyType,
  year_start: number,
  retail_band: string,
  opts: { year_end?: number | null; popular?: boolean } = {}
): CatalogSeed {
  return {
    brand,
    model,
    engine_cc,
    body_type,
    year_start,
    year_end: opts.year_end ?? null,
    retail_band,
    popular: opts.popular ?? false
  };
}

const RE = "Royal Enfield";
const KTM_BAND = "KTM (Bajaj)";
const TRI = "Triumph (Bajaj)";
const HONDA = "Honda BigWing";
const HD = "Harley-Davidson";
const HD_HERO = "Harley-Davidson (Hero)";
const BMW = "BMW Motorrad (TVS)";
const JAWA = "Jawa";
const YEZDI = "Yezdi";
const BSA_BAND = "BSA";
const QJ = "QJ Motor";
const BAJAJ = "Bajaj";
const HERO = "Hero MotoCorp";

export const BIKE_CATALOG_SEED: CatalogSeed[] = [
  // ── Royal Enfield ───────────────────────────────────────────────────────
  bike(RE, "Bullet 350", 349, "Modern Classic", 2023, RE, { popular: true }),
  bike(RE, "Classic 350", 349, "Modern Classic", 2021, RE, { popular: true }),
  bike(RE, "Goan Classic 350", 349, "Cruiser", 2024, RE),
  bike(RE, "Hunter 350", 349, "Roadster", 2022, RE, { popular: true }),
  bike(RE, "Meteor 350", 349, "Cruiser", 2020, RE, { popular: true }),
  bike(RE, "Scram 440", 443, "Scrambler", 2025, RE),
  bike(RE, "Himalayan 450", 452, "Adventure", 2023, RE, { popular: true }),
  bike(RE, "Guerrilla 450", 452, "Roadster", 2024, RE, { popular: true }),
  bike(RE, "Interceptor 650", 648, "Roadster", 2018, RE, { popular: true }),
  bike(RE, "Continental GT 650", 648, "Cafe Racer", 2018, RE, { popular: true }),
  bike(RE, "Super Meteor 650", 648, "Cruiser", 2023, RE, { popular: true }),
  bike(RE, "Shotgun 650", 648, "Cruiser", 2024, RE),
  bike(RE, "Classic 650", 648, "Modern Classic", 2025, RE),
  bike(RE, "Bear 650", 648, "Scrambler", 2025, RE),
  bike(RE, "Himalayan 411", 411, "Adventure", 2016, RE, { year_end: 2023, popular: true }),
  bike(RE, "Scram 411", 411, "Scrambler", 2022, RE, { year_end: 2024 }),

  // ── KTM (Bajaj) ─────────────────────────────────────────────────────────
  bike("KTM", "390 Duke", 399, "Roadster", 2024, KTM_BAND, { popular: true }),
  bike("KTM", "RC 390", 373, "Sport", 2022, KTM_BAND, { popular: true }),
  bike("KTM", "390 Adventure", 399, "Adventure", 2024, KTM_BAND, { popular: true }),
  bike("KTM", "390 SMC R", 399, "Supermoto", 2025, KTM_BAND),
  bike("KTM", "390 Enduro R", 399, "Enduro", 2025, KTM_BAND),

  // ── Triumph (Bajaj) ─────────────────────────────────────────────────────
  bike("Triumph", "Speed 400", 398, "Roadster", 2023, TRI, { popular: true }),
  bike("Triumph", "Scrambler 400 X", 398, "Scrambler", 2023, TRI, { popular: true }),
  bike("Triumph", "Speed T4", 398, "Roadster", 2024, TRI),
  bike("Triumph", "Trident 660", 660, "Roadster", 2021, TRI, { popular: true }),
  bike("Triumph", "Daytona 660", 660, "Sport", 2024, TRI),
  bike("Triumph", "Tiger Sport 660", 660, "Adventure", 2022, TRI),
  bike("Triumph", "Speed Twin 900", 900, "Modern Classic", 2019, TRI),
  bike("Triumph", "Bonneville T100", 900, "Modern Classic", 2017, TRI),
  bike("Triumph", "Scrambler 900", 900, "Scrambler", 2019, TRI),
  bike("Triumph", "Speed Twin 1200", 1200, "Modern Classic", 2019, TRI),
  bike("Triumph", "Bonneville T120", 1200, "Modern Classic", 2016, TRI),
  bike("Triumph", "Scrambler 1200 X", 1200, "Scrambler", 2024, TRI),
  bike("Triumph", "Street Triple 765", 765, "Roadster", 2023, TRI),
  bike("Triumph", "Speed Triple 1200 RS", 1160, "Roadster", 2021, TRI),
  bike("Triumph", "Tiger 900", 888, "Adventure", 2020, TRI),
  bike("Triumph", "Rocket 3", 2458, "Cruiser", 2020, TRI),

  // ── Honda BigWing ───────────────────────────────────────────────────────
  bike("Honda", "CB350", 348, "Modern Classic", 2021, HONDA, { popular: true }),
  bike("Honda", "CB350RS", 348, "Modern Classic", 2021, HONDA, { popular: true }),
  bike("Honda", "CB300R", 286, "Roadster", 2019, HONDA),
  bike("Honda", "CB300F", 293, "Roadster", 2022, HONDA),
  bike("Honda", "NX500", 471, "Adventure", 2024, HONDA),
  bike("Honda", "CL500", 471, "Scrambler", 2023, HONDA),
  bike("Honda", "Rebel 500", 471, "Cruiser", 2023, HONDA),
  bike("Honda", "CB500 Hornet", 471, "Roadster", 2024, HONDA),
  bike("Honda", "CBR500R", 471, "Sport", 2024, HONDA),
  bike("Honda", "CB650R", 649, "Roadster", 2019, HONDA),
  bike("Honda", "CBR650R", 649, "Sport", 2019, HONDA),
  bike("Honda", "Africa Twin", 1084, "Adventure", 2020, HONDA),
  bike("Honda", "Gold Wing", 1833, "Tourer", 2018, HONDA),

  // ── Harley-Davidson ─────────────────────────────────────────────────────
  bike(HD, "X440", 440, "Roadster", 2023, HD_HERO, { popular: true }),
  bike(HD, "Nightster", 975, "Cruiser", 2022, HD),
  bike(HD, "Sportster S", 1252, "Cruiser", 2021, HD),
  bike(HD, "Fat Bob 114", 1868, "Cruiser", 2018, HD),
  bike(HD, "Street Bob 114", 1868, "Cruiser", 2018, HD),
  bike(HD, "Low Rider S", 1923, "Cruiser", 2022, HD),
  bike(HD, "Road Glide", 1868, "Tourer", 2020, HD),
  bike(HD, "Pan America 1250", 1252, "Adventure", 2021, HD),

  // ── BMW Motorrad (TVS-built 310s + imports) ─────────────────────────────
  bike("BMW", "G 310 R", 313, "Roadster", 2018, BMW, { popular: true }),
  bike("BMW", "G 310 GS", 313, "Adventure", 2018, BMW, { popular: true }),
  bike("BMW", "G 310 RR", 313, "Sport", 2022, BMW),
  bike("BMW", "F 450 GS", 420, "Adventure", 2026, BMW),
  bike("BMW", "F 900 R", 895, "Roadster", 2020, BMW),
  bike("BMW", "F 900 GS", 895, "Adventure", 2024, BMW),
  bike("BMW", "R 1300 GS", 1300, "Adventure", 2024, BMW),
  bike("BMW", "S 1000 RR", 999, "Sport", 2019, BMW),

  // ── Jawa (Classic Legends) ──────────────────────────────────────────────
  bike(JAWA, "Jawa 350", 334, "Modern Classic", 2022, JAWA),
  bike(JAWA, "Jawa 42", 334, "Roadster", 2019, JAWA, { popular: true }),
  bike(JAWA, "Jawa 42 Bobber", 334, "Bobber", 2022, JAWA, { popular: true }),
  bike(JAWA, "Jawa 42 FJ", 334, "Roadster", 2025, JAWA),
  bike(JAWA, "Perak", 334, "Bobber", 2020, JAWA),

  // ── Yezdi (Classic Legends) ─────────────────────────────────────────────
  bike(YEZDI, "Roadster", 334, "Roadster", 2022, YEZDI),
  bike(YEZDI, "Scrambler", 334, "Scrambler", 2022, YEZDI),
  bike(YEZDI, "Adventure", 334, "Adventure", 2022, YEZDI),

  // ── BSA ─────────────────────────────────────────────────────────────────
  bike(BSA_BAND, "Gold Star 650", 652, "Modern Classic", 2023, BSA_BAND),
  bike(BSA_BAND, "Scrambler 650", 652, "Scrambler", 2026, BSA_BAND),

  // ── QJ Motor ────────────────────────────────────────────────────────────
  bike(QJ, "SRK 400", 400, "Roadster", 2024, QJ),
  bike(QJ, "SRT 400X", 400, "Adventure", 2024, QJ),
  bike(QJ, "SRV 300", 296, "Cruiser", 2024, QJ),
  bike(QJ, "SRK 600", 600, "Roadster", 2025, QJ),
  bike(QJ, "SRT 700", 693, "Adventure", 2025, QJ),

  // ── Bajaj ───────────────────────────────────────────────────────────────
  bike(BAJAJ, "Dominar 400", 373, "Sport", 2019, BAJAJ, { popular: true }),

  // ── Hero MotoCorp ───────────────────────────────────────────────────────
  bike(HERO, "Mavrick 440", 440, "Roadster", 2024, HERO, { popular: true })
];

const SEED_TS = "2026-07-11T00:00:00.000Z";

// Full catalogue rows (with synthetic ids/timestamps) for demo/no-env rendering.
export const BIKE_CATALOG: BikeCatalogEntry[] = BIKE_CATALOG_SEED.map((seed, index) => ({
  ...seed,
  id: `cat-${index + 1}`,
  created_at: SEED_TS,
  updated_at: SEED_TS
}));

export const CATALOG_BRANDS = Array.from(new Set(BIKE_CATALOG.map((b) => b.brand)));
