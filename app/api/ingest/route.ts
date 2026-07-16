import { type NextRequest, NextResponse } from "next/server";
import { runIngestion } from "@/lib/ingestion/pipeline";
import { INGEST_SOURCES, IngestResponseSchema, IngestSourceSchema } from "@/lib/ingestion/contracts";

export const dynamic = "force-dynamic";

// Batch ingestion endpoint. Off by default: without INGEST_CRON_SECRET (or
// Vercel's CRON_SECRET) every call gets 503. With a secret set, Vercel Cron
// (which sends `Authorization: Bearer $CRON_SECRET`) or a manual curl with the
// same header can trigger a run. Writes go through the service role client.
function checkAuth(request: NextRequest): NextResponse | null {
  const secret = process.env.INGEST_CRON_SECRET || process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Ingestion is disabled. Set INGEST_CRON_SECRET (or CRON_SECRET) to enable this endpoint." },
      { status: 503 }
    );
  }
  const header = request.headers.get("authorization");
  const provided = header?.replace(/^Bearer\s+/i, "") ?? request.nextUrl.searchParams.get("secret");
  if (provided !== secret) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return null;
}

async function handle(request: NextRequest) {
  const denied = checkAuth(request);
  if (denied) return denied;

  // Bound the request: `source` must be one of the known ingestion sources.
  const parsedSource = IngestSourceSchema.safeParse(request.nextUrl.searchParams.get("source") ?? undefined);
  if (!parsedSource.success) {
    return NextResponse.json(
      { error: `Invalid source. Expected one of: ${INGEST_SOURCES.join(", ")}.` },
      { status: 400 }
    );
  }

  try {
    const outcome = await runIngestion(parsedSource.data);
    // Bound the response: guarantees the shape the cron/clients rely on.
    return NextResponse.json(IngestResponseSchema.parse(outcome));
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return handle(request);
}

// Vercel Cron invokes with GET.
export async function GET(request: NextRequest) {
  return handle(request);
}
