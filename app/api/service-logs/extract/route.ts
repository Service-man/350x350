import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import { MAX_UPLOAD_BYTES, extractServiceLogFromFile, isAcceptedUpload } from "@/lib/kundli/extract";

// Reads a bill for the service-log page's upload-first flow and returns a
// draft to pre-fill the manual form. No chat, nothing persisted.
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return NextResponse.json({ error: "Attach a bill image or PDF." }, { status: 400 });
  if (file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: "That file is over 4 MB — try a smaller photo or PDF." }, { status: 413 });
  if (!isAcceptedUpload(file.type, file.name)) return NextResponse.json({ error: "Please upload a JPG, PNG, WebP or PDF." }, { status: 415 });

  const result = await extractServiceLogFromFile({ name: file.name, mime: file.type, bytes: Buffer.from(await file.arrayBuffer()) });
  return NextResponse.json({ draft: result.draft, via: result.via });
}
