import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import { isDemoSupabaseConfig } from "@/lib/supabase/config";
import { CRUISING_SPEEDS, PILLION_OPTIONS, RIDE_FREQUENCIES, SERVICE_NUMBERS } from "@/lib/constants/bikes";
import { KUNDLI_SYSTEM } from "@/lib/kundli/prompts";
import { getLlmProvider, llmChat } from "@/lib/kundli/llm";
import { ACCEPTED_MIMES, MAX_UPLOAD_BYTES, extractServiceLogFromFile, isAcceptedUpload, type ExtractionResult } from "@/lib/kundli/extract";
import { composeReply, contextBlock, parseAnswer, splitTrailer } from "@/lib/kundli/reading";
import { isProfileField, loadKundliContext, updateRidingProfile } from "@/lib/kundli/context";
import { addMessage, getOrCreateChat, listMessages, newChat } from "@/lib/kundli/store";
import type { KundliAskField, KundliMeta, RidingProfile, ServiceLogDraft } from "@/lib/types";

// One chat turn. Multipart so a bill (image/PDF) can ride along with the text.
//   intent=new_chat                      → start a fresh session
//   intent=message  text? file? chat_id? → answer, persist, return both messages
// Demo mode has no storage, so the browser sends back the last ask, the
// pending draft, and the accumulated riding answers on every turn.

export const runtime = "nodejs";
export const maxDuration = 60;

const DRAFT_FIELDS: KundliAskField[] = ["service_number", "odometer_km", "service_date", "parts_reason"];

function chipsFor(field: KundliAskField | null): string[] {
  switch (field) {
    case "cruising_speed": return CRUISING_SPEEDS.map(([, l]) => l);
    case "ride_frequency": return RIDE_FREQUENCIES.map(([, l]) => l);
    case "pillion": return PILLION_OPTIONS.map(([, l]) => l);
    case "service_number": return SERVICE_NUMBERS.map(([, l]) => l);
    case "daily_distance_km": return ["Under 10 km", "10–30 km", "30–60 km", "60–100 km", "100+ km"];
    case "daily_ride_minutes": return ["Under 30 min", "30–60 min", "1–2 hours", "2+ hours"];
    case "parts_reason": return ["Regular wear", "Failed early", "Mechanic suggested", "Not sure"];
    default: return [];
  }
}

function safeJson<T>(raw: FormDataEntryValue | null): T | null {
  if (typeof raw !== "string" || !raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Please log in to read your kundli." }, { status: 401 });

  const form = await request.formData();
  const intent = String(form.get("intent") ?? "message");
  const bikeId = String(form.get("bike_id") ?? "") || null;
  const demo = isDemoSupabaseConfig();

  if (intent === "new_chat") {
    const chat = await newChat(user.id, bikeId);
    return NextResponse.json({ chat_id: chat.id, messages: [] });
  }

  const text = String(form.get("text") ?? "").trim().slice(0, 4000);
  const file = form.get("file");
  const hasFile = file instanceof File && file.size > 0;
  if (!text && !hasFile) return NextResponse.json({ error: "Say something or attach a bill." }, { status: 400 });

  const ctx = await loadKundliContext(user.id, bikeId);
  // Demo mode: riding answers live in the browser; merge them in for this turn.
  if (demo && ctx.bike) {
    const demoProfile = safeJson<RidingProfile>(form.get("demo_profile"));
    if (demoProfile) ctx.bike.riding_profile = { ...(ctx.bike.riding_profile ?? {}), ...demoProfile };
  }

  const chat = await getOrCreateChat(user.id, ctx.bike?.id ?? null, String(form.get("chat_id") ?? "") || null);
  const history = await listMessages(chat.id);
  const lastAssistant = [...history].reverse().find((m) => m.role === "assistant");

  let pendingDraft: ServiceLogDraft | null = lastAssistant?.meta?.draft ?? safeJson<ServiceLogDraft>(form.get("pending_draft"));
  const askField = (lastAssistant?.meta?.ask ?? (String(form.get("last_ask") ?? "") || null)) as KundliAskField | null;
  let justAnswered: KundliAskField | null = null;

  // Apply the answer to whatever the assistant last asked for.
  if (askField && text) {
    const value = parseAnswer(askField, text);
    if (value !== null) {
      if (isProfileField(askField) && ctx.bike) {
        ctx.bike.riding_profile = await updateRidingProfile(user.id, ctx.bike, { [askField]: value } as Partial<RidingProfile>);
        justAnswered = askField;
      } else if (DRAFT_FIELDS.includes(askField) && pendingDraft) {
        pendingDraft =
          askField === "parts_reason"
            ? { ...pendingDraft, notes: `Why replaced: ${value}` }
            : { ...pendingDraft, [askField]: value };
        justAnswered = askField;
      }
    }
  }

  // Read an attached bill.
  let extraction: ExtractionResult | null = null;
  let attachmentName: string | null = null;
  if (hasFile) {
    if (file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: "That file is over 4 MB — a phone photo or a smaller PDF works best." }, { status: 413 });
    if (!isAcceptedUpload(file.type, file.name)) return NextResponse.json({ error: `Please upload a JPG, PNG, WebP or PDF (${ACCEPTED_MIMES.length} formats supported).` }, { status: 415 });
    attachmentName = file.name;
    extraction = await extractServiceLogFromFile({ name: file.name, mime: file.type, bytes: Buffer.from(await file.arrayBuffer()) });
    pendingDraft = {
      ...extraction.draft,
      bike_id: ctx.bike?.id ?? null,
      brand: extraction.draft.brand ?? ctx.bike?.brand ?? null,
      model: extraction.draft.model ?? ctx.bike?.model ?? null,
      year: extraction.draft.year ?? ctx.bike?.manufacturing_year ?? null
    };
  }

  const userContent = text || (attachmentName ? `Uploaded ${attachmentName}` : "");
  const userMessage = await addMessage(chat, user.id, "user", userContent, {
    attachment_name: attachmentName,
    meta: extraction ? { draft: pendingDraft } : null
  });

  // Compose the reply: AI when configured, the rules engine otherwise (and as
  // the safety net if the AI call fails).
  const provider = getLlmProvider();
  let replyText: string | null = null;
  let ask: KundliAskField | null = null;
  let chips: string[] = [];

  if (provider !== "rules") {
    const system = `${KUNDLI_SYSTEM}\n\n${contextBlock(ctx, pendingDraft)}${extraction ? `\nEXTRACTION_QUALITY: ${extraction.via}` : ""}`;
    const turns = history.slice(-12).map((m) => ({ role: m.role, content: m.content }));
    turns.push({ role: "user", content: justAnswered ? `${userContent}\n(Answered: ${justAnswered})` : userContent });
    const raw = await llmChat({ system, turns });
    if (raw) {
      const t = splitTrailer(raw);
      replyText = t.body;
      ask = t.ask;
      chips = t.chips.length ? t.chips : chipsFor(t.ask);
    }
  }

  if (!replyText) {
    const draftInPlay = extraction ? pendingDraft : justAnswered && DRAFT_FIELDS.includes(justAnswered) ? pendingDraft : null;
    const rules = composeReply({
      ctx,
      userText: text,
      draft: draftInPlay,
      extractionVia: extraction?.via ?? (draftInPlay ? "rules" : undefined),
      justAnswered
    });
    replyText = rules.text;
    ask = rules.ask;
    chips = rules.chips;
    if (rules.draft) pendingDraft = rules.draft;
  }

  const meta: KundliMeta = { draft: pendingDraft ?? null, ask, chips, provider };
  const assistantMessage = await addMessage(chat, user.id, "assistant", replyText, { meta });

  return NextResponse.json({
    chat_id: chat.id,
    bike_id: ctx.bike?.id ?? null,
    profile: ctx.bike?.riding_profile ?? {},
    provider,
    messages: [userMessage, assistantMessage]
  });
}
