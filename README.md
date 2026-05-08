# 350x Garage

350x Garage is a low-cost rider intelligence and bike health logging MVP for 350cc+ motorcycles in India. It captures first-party rider data such as bike details, odometer readings, service logs, service bills, and symptoms, then shows seed model-wise issue intelligence and simple rule-based component risk scores.

This version intentionally does not do predictive maintenance, OCR, unofficial scraping, or Facebook/Instagram scraping.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth, Postgres, Row Level Security, and Storage
- lucide-react icons

## Local Setup

Install dependencies:

```bash
npm install
```

Use Node.js `20.9.0` or newer. The project is configured for current Next.js and Supabase packages.

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

`SUPABASE_SERVICE_ROLE_KEY` is included for future server/admin use. Do not expose it to client components.

Run the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Supabase Setup

Create a Supabase project, then run the SQL files in order from `supabase/migrations`:

1. `001_initial_schema.sql`
2. `002_rls_policies.sql`
3. `003_seed_issue_clusters.sql`

The first migration creates the private `service-bills` storage bucket. Service bill files are uploaded under:

```text
{user_id}/{bike_id}/{timestamp}-{filename}
```

## Migrations and Seed Data

The schema includes:

- `profiles`
- `bikes`
- `service_logs`
- `symptom_logs`
- `issue_clusters`

RLS policies ensure users can read and write only their own profile, bikes, service logs, and symptom logs. Authenticated users can read `issue_clusters`.

Seed issue clusters cover Royal Enfield Classic 350, Hunter 350, Meteor 350, Himalayan 450, Honda CB350, KTM Duke 390, and Triumph Speed 400.

## Deployment Notes for Vercel

1. Push the repository to GitHub.
2. Import it into Vercel.
3. Add the same Supabase environment variables in Vercel Project Settings.
4. Run Supabase migrations before first production use.
5. Deploy with the default Next.js build command.

## Known Limitations

- Risk scores are early rule-based indicators, not OEM-certified diagnostics.
- Service bill OCR is not implemented.
- Uploaded bill files are stored privately and listed through temporary signed URLs.
- No paid APIs or third-party ingestion are used in v0.
- Delete-my-data is a settings placeholder in this MVP.

## Future Roadmap

- YouTube API ingestion for ownership videos/comments
- Reddit compliant API ingestion
- OBD Phase 2 integration
- OCR extraction from service bills
- Component lifecycle prediction after enough labelled service/failure data
- Mechanic/dealer dashboard
- Used-bike inspection report
