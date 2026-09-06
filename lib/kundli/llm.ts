import { createAnthropic, VALIDATION_MODEL } from "@/lib/ingestion/llm/anthropic";

// Provider-agnostic chat completion for the kundli. Resolution order:
//   1. OPENAI_API_KEY   → OpenAI chat completions (vision-capable)
//   2. ANTHROPIC_API_KEY → the existing Anthropic client
//   3. neither          → "rules": callers fall back to the deterministic engine
// Keys are read from the environment only; nothing is hard-coded.

export type LlmProvider = "openai" | "anthropic" | "rules";

export type ChatTurn = { role: "user" | "assistant"; content: string };
export type LlmImage = { mime: string; base64: string };

export function getLlmProvider(): LlmProvider {
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  return "rules";
}

export function isKundliAiConfigured(): boolean {
  return getLlmProvider() !== "rules";
}

const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

type LlmOptions = {
  system: string;
  turns: ChatTurn[];
  images?: LlmImage[]; // attached to the final user turn
  json?: boolean;
  maxTokens?: number;
  timeoutMs?: number;
};

// Returns the assistant text, or null when no provider is configured or the
// call failed — callers always have a rules-based path to fall back to.
export async function llmChat(opts: LlmOptions): Promise<string | null> {
  const provider = getLlmProvider();
  try {
    if (provider === "openai") return await openaiChat(opts);
    if (provider === "anthropic") return await anthropicChat(opts);
  } catch (error) {
    console.error("[kundli] llm call failed:", error instanceof Error ? error.message : error);
  }
  return null;
}

async function openaiChat({ system, turns, images = [], json, maxTokens = 700, timeoutMs = 45_000 }: LlmOptions) {
  const messages: Array<{ role: string; content: unknown }> = [{ role: "system", content: system }];
  turns.forEach((turn, index) => {
    const isLast = index === turns.length - 1;
    if (isLast && turn.role === "user" && images.length > 0) {
      messages.push({
        role: "user",
        content: [
          { type: "text", text: turn.content },
          ...images.map((img) => ({ type: "image_url", image_url: { url: `data:${img.mime};base64,${img.base64}` } }))
        ]
      });
    } else {
      messages.push({ role: turn.role, content: turn.content });
    }
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(OPENAI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages,
        max_tokens: maxTokens,
        temperature: json ? 0 : 0.5,
        ...(json ? { response_format: { type: "json_object" } } : {})
      }),
      signal: controller.signal
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`OpenAI ${response.status}: ${body.slice(0, 200)}`);
    }
    const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    return data.choices?.[0]?.message?.content?.trim() ?? null;
  } finally {
    clearTimeout(timer);
  }
}

async function anthropicChat({ system, turns, images = [], json, maxTokens = 700 }: LlmOptions) {
  const client = createAnthropic();
  if (!client) return null;
  const model = process.env.KUNDLI_ANTHROPIC_MODEL ?? VALIDATION_MODEL;
  const messages = turns.map((turn, index) => {
    const isLast = index === turns.length - 1;
    if (isLast && turn.role === "user" && images.length > 0) {
      return {
        role: "user" as const,
        content: [
          ...images.map((img) => ({
            type: "image" as const,
            source: { type: "base64" as const, media_type: img.mime as "image/jpeg" | "image/png" | "image/webp" | "image/gif", data: img.base64 }
          })),
          { type: "text" as const, text: turn.content }
        ]
      };
    }
    return { role: turn.role, content: turn.content };
  });
  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system: json ? `${system}\nRespond with JSON only — no prose, no code fences.` : system,
    messages
  });
  const text = response.content
    .map((block) => ("text" in block && typeof block.text === "string" ? block.text : ""))
    .filter(Boolean)
    .join("\n")
    .trim();
  return text || null;
}

// Tolerant JSON pull: models sometimes wrap JSON in fences or prose.
export function parseJsonObject<T>(raw: string | null): T | null {
  if (!raw) return null;
  const cleaned = raw.replace(/```(?:json)?/gi, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}
