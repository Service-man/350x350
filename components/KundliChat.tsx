"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Paperclip, Plus, Send, Sparkles } from "lucide-react";
import type { Bike, KundliMessage, RidingProfile, ServiceLogDraft } from "@/lib/types";
import { cn } from "@/lib/utils";

// The kundli chat: mobile-first, one scrolling column, sticky composer.
// Quick-reply chips come from the last assistant turn; an extracted bill
// draft renders a "Save as service log" card that pre-fills the form.

type Props = {
  initialChatId: string | null;
  initialMessages: KundliMessage[];
  bikes: Bike[];
  initialBikeId: string | null;
  demo: boolean;
  aiConfigured: boolean;
};

type Reply = {
  chat_id: string;
  bike_id: string | null;
  profile: RidingProfile;
  provider: string;
  messages: KundliMessage[];
  error?: string;
};

export function encodeDraft(draft: ServiceLogDraft) {
  return encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(draft)))));
}

// Kept outside the component so the React compiler lint sees the handler as pure.
function localId() {
  return `local-${Date.now()}`;
}
function nowIso() {
  return new Date().toISOString();
}

export function KundliChat({ initialChatId, initialMessages, bikes, initialBikeId, demo, aiConfigured }: Props) {
  const router = useRouter();
  const [chatId, setChatId] = useState(initialChatId);
  const [messages, setMessages] = useState<KundliMessage[]>(initialMessages);
  const [bikeId, setBikeId] = useState<string | null>(initialBikeId);
  const [demoProfile, setDemoProfile] = useState<RidingProfile>({});
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  const chips = !sending ? lastAssistant?.meta?.chips ?? [] : [];
  const bike = bikes.find((b) => b.id === bikeId) ?? bikes[0];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function send(content: string, attached: File | null = file) {
    const trimmed = content.trim();
    if ((!trimmed && !attached) || sending) return;
    setError("");
    setSending(true);
    setText("");
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";

    // Optimistic user bubble.
    const optimistic: KundliMessage = {
      id: localId(),
      chat_id: chatId ?? "",
      user_id: "",
      role: "user",
      content: trimmed || (attached ? `Uploaded ${attached.name}` : ""),
      attachment_name: attached?.name ?? null,
      meta: null,
      created_at: nowIso()
    };
    setMessages((m) => [...m, optimistic]);

    const form = new FormData();
    form.set("intent", "message");
    form.set("text", trimmed);
    if (chatId) form.set("chat_id", chatId);
    if (bikeId) form.set("bike_id", bikeId);
    if (attached) form.set("file", attached);
    if (demo) {
      form.set("demo_profile", JSON.stringify(demoProfile));
      if (lastAssistant?.meta?.ask) form.set("last_ask", lastAssistant.meta.ask);
      if (lastAssistant?.meta?.draft) form.set("pending_draft", JSON.stringify(lastAssistant.meta.draft));
    }

    try {
      const response = await fetch("/api/kundli", { method: "POST", body: form });
      const data = (await response.json()) as Reply;
      if (!response.ok) throw new Error(data.error ?? "The kundli went quiet — try again.");
      setChatId(data.chat_id);
      if (data.bike_id) setBikeId(data.bike_id);
      if (demo) setDemoProfile(data.profile ?? {});
      setMessages((m) => [...m.filter((x) => x.id !== optimistic.id), ...data.messages]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setMessages((m) => m.filter((x) => x.id !== optimistic.id));
      setText(trimmed);
    } finally {
      setSending(false);
      textRef.current?.focus();
    }
  }

  async function startNewChat() {
    if (sending) return;
    setError("");
    const form = new FormData();
    form.set("intent", "new_chat");
    if (bikeId) form.set("bike_id", bikeId);
    const response = await fetch("/api/kundli", { method: "POST", body: form });
    const data = (await response.json()) as Reply;
    if (response.ok) {
      setChatId(data.chat_id);
      setMessages([]);
      setDemoProfile({});
    }
  }

  const greeting = (
    <Bubble role="assistant">
      <p className="font-bold text-ink">Namaste 🙏 I&apos;m your bike&apos;s kundli.</p>
      <p className="mt-1.5">
        Upload your latest service bill (photo or PDF) and I&apos;ll read what was done, ask a couple of questions
        about how you ride, and tell you which parts are written to need attention next.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="btn-primary h-9 px-3 text-[13px]" onClick={() => fileRef.current?.click()}>
          <Paperclip className="h-4 w-4" aria-hidden="true" /> Upload service bill
        </button>
        <button type="button" className="btn-secondary h-9 px-3 text-[13px]" onClick={() => send("Read my bike's kundli")}>
          <Sparkles className="h-4 w-4" aria-hidden="true" /> Just read my kundli
        </button>
      </div>
    </Bubble>
  );

  return (
    <div className="flex h-[calc(100dvh-190px)] min-h-[520px] flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-soft lg:h-[calc(100dvh-170px)]">
      {/* Header strip */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 px-3 py-2.5 sm:px-4">
        {bikes.length > 1 ? (
          <select className="field h-9 w-auto max-w-[220px] py-0 text-[13px]" value={bike?.id ?? ""} onChange={(e) => setBikeId(e.target.value || null)} disabled={sending}>
            {bikes.map((b) => (
              <option key={b.id} value={b.id}>{b.brand} {b.model}</option>
            ))}
          </select>
        ) : bike ? (
          <span className="rounded-full bg-paper px-3 py-1 font-mono text-[11px] uppercase text-road">{bike.brand} {bike.model} · {new Intl.NumberFormat("en-IN").format(bike.odometer_km)} km</span>
        ) : (
          <span className="rounded-full bg-paper px-3 py-1 font-mono text-[11px] uppercase text-road">No bike yet</span>
        )}
        <span className="ml-auto flex items-center gap-2">
          <span className="hidden font-mono text-[10.5px] uppercase text-lavmute sm:inline">{aiConfigured ? "AI reading" : demo ? "demo · rules engine" : "rules engine"}</span>
          <button type="button" className="btn-secondary h-9 px-3 text-[12.5px]" onClick={startNewChat} disabled={sending}>
            <Plus className="h-4 w-4" aria-hidden="true" /> New chat
          </button>
        </span>
      </div>

      {/* Transcript */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-paper/60 px-3 py-4 sm:px-4">
        {messages.length === 0 ? greeting : null}
        {messages.map((m) => (
          <Bubble key={m.id} role={m.role} attachment={m.attachment_name}>
            <Markdown text={m.content} />
            {m.role === "assistant" && m.meta?.draft && hasSaveableDraft(m.meta.draft) ? (
              <DraftCard draft={m.meta.draft} onSave={() => router.push(`/service-logs?draft=${encodeDraft(m.meta!.draft!)}`)} />
            ) : null}
          </Bubble>
        ))}
        {sending ? (
          <Bubble role="assistant">
            <span className="inline-flex gap-1" aria-label="Reading">
              <Dot /><Dot delay="150ms" /><Dot delay="300ms" />
            </span>
          </Bubble>
        ) : null}
      </div>

      {/* Chips */}
      {chips.length > 0 ? (
        <div className="flex gap-2 overflow-x-auto border-t border-stone-200 px-3 py-2 sm:px-4">
          {chips.map((chip) => (
            <button key={chip} type="button" className="shrink-0 rounded-full border border-leaf/40 bg-mint px-3 py-1.5 text-[12.5px] font-bold text-leaf transition hover:bg-leaf hover:text-white" onClick={() => send(chip, null)}>
              {chip}
            </button>
          ))}
        </div>
      ) : null}

      {/* Composer */}
      <form
        className="border-t border-stone-200 p-2.5 sm:p-3"
        onSubmit={(e) => {
          e.preventDefault();
          send(text);
        }}
      >
        {error ? <p className="mb-2 rounded bg-red-50 px-3 py-2 text-[12.5px] text-danger">{error}</p> : null}
        {file ? (
          <p className="mb-2 flex items-center gap-2 rounded bg-mint px-3 py-1.5 text-[12.5px] font-medium text-leaf">
            <Paperclip className="h-3.5 w-3.5" aria-hidden="true" /> {file.name}
            <button type="button" className="ml-auto text-steel hover:text-ink" onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ""; }}>remove</button>
          </p>
        ) : null}
        <div className="flex items-end gap-2">
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,application/pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <button type="button" className="btn-secondary h-11 w-11 shrink-0 p-0" onClick={() => fileRef.current?.click()} disabled={sending} aria-label="Attach a service bill">
            <Paperclip className="h-4 w-4" aria-hidden="true" />
          </button>
          <textarea
            ref={textRef}
            className="field min-h-[44px] flex-1 resize-none py-2.5 text-[15px]"
            rows={1}
            placeholder={file ? "Add a note about this bill (optional)…" : "Ask about your bike, or answer above…"}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(text);
              }
            }}
            disabled={sending}
          />
          <button type="submit" className="btn-primary h-11 w-11 shrink-0 p-0" disabled={sending || (!text.trim() && !file)} aria-label="Send">
            <Send className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        {demo ? <p className="mt-1.5 text-[11px] text-steel">Demo mode: this chat isn&apos;t saved. Add Supabase keys to keep history.</p> : null}
      </form>
    </div>
  );
}

function hasSaveableDraft(draft: ServiceLogDraft) {
  return Boolean(draft.service_date || draft.odometer_km || draft.total_cost || draft.parts_replaced);
}

function Bubble({ role, children, attachment }: { role: "user" | "assistant"; children: ReactNode; attachment?: string | null }) {
  const isUser = role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[88%] rounded-2xl px-4 py-3 text-[14.5px] leading-6 sm:max-w-[75%]",
          isUser ? "rounded-br-md bg-ink text-white" : "rounded-bl-md border border-stone-200 bg-white text-road"
        )}
      >
        {attachment ? (
          <p className={cn("mb-1 flex items-center gap-1.5 font-mono text-[11px] uppercase", isUser ? "text-lav" : "text-lavmute")}>
            <Paperclip className="h-3 w-3" aria-hidden="true" /> {attachment}
          </p>
        ) : null}
        {children}
      </div>
    </div>
  );
}

function DraftCard({ draft, onSave }: { draft: ServiceLogDraft; onSave: () => void }) {
  const bits = [
    draft.service_date ? `📅 ${draft.service_date}` : null,
    draft.odometer_km ? `🛣 ${new Intl.NumberFormat("en-IN").format(draft.odometer_km)} km` : null,
    draft.total_cost ? `₹${new Intl.NumberFormat("en-IN").format(draft.total_cost)}` : null,
    draft.service_number ? `service #${draft.service_number === "post5" ? "5+" : draft.service_number}` : null,
    draft.parts_replaced ? `🔧 ${draft.parts_replaced}` : null
  ].filter(Boolean);
  return (
    <div className="mt-3 rounded-lg border border-leaf/30 bg-mint/60 p-3">
      <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-leaf">Service log draft</p>
      <p className="mt-1 text-[13px] text-ink">{bits.join(" · ") || "Partial details — you can complete them on the form."}</p>
      <button type="button" className="btn-primary mt-2.5 h-9 px-3 text-[13px]" onClick={onSave}>
        Save as service log →
      </button>
    </div>
  );
}

function Dot({ delay = "0ms" }: { delay?: string }) {
  return <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-leaf" style={{ animationDelay: delay }} />;
}

// Tiny renderer for the assistant's markdown-ish text: paragraphs, bullets,
// numbered items, and **bold**. Deliberately no HTML passthrough.
export function Markdown({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  const flush = () => {
    if (!list) return;
    const Tag = list.ordered ? "ol" : "ul";
    blocks.push(
      <Tag key={`l-${blocks.length}`} className={cn("my-1.5 space-y-1 pl-5", list.ordered ? "list-decimal" : "list-disc")}>
        {list.items.map((item, i) => <li key={i}>{inline(item)}</li>)}
      </Tag>
    );
    list = null;
  };
  for (const raw of text.split("\n")) {
    const line = raw.trimEnd();
    const bullet = line.match(/^\s*[-•]\s+(.*)$/);
    const numbered = line.match(/^\s*\d+[.)]\s+(.*)$/);
    const indented = line.match(/^\s{2,}(\S.*)$/);
    if (bullet || numbered) {
      const ordered = Boolean(numbered);
      if (!list || list.ordered !== ordered) { flush(); list = { ordered, items: [] }; }
      list.items.push((bullet ?? numbered)![1]);
    } else if (indented && list) {
      list.items[list.items.length - 1] += ` — ${indented[1]}`;
    } else if (line.trim() === "") {
      flush();
    } else {
      flush();
      blocks.push(<p key={`p-${blocks.length}`} className="my-1">{inline(line)}</p>);
    }
  }
  flush();
  return <>{blocks}</>;
}

function inline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? <strong key={i} className="font-bold text-ink">{part.slice(2, -2)}</strong> : <span key={i}>{part}</span>
  );
}
