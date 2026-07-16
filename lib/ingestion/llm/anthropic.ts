import Anthropic from "@anthropic-ai/sdk";

// The validation/enrichment layer is dormant by default: without ANTHROPIC_API_KEY
// the pipeline skips the LLM pass entirely (deterministic normalization still runs),
// so builds and demo mode never depend on a key being present.
export function createAnthropic(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  return new Anthropic({ apiKey });
}

// Overridable so a cheaper/faster model can be swapped in without code changes.
export const VALIDATION_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-4-8";

export function isLlmConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}
