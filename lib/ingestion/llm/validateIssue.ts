import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import {
  IssueValidationSchema,
  type IssueValidation,
  type KnownIssueCandidate
} from "@/lib/ingestion/contracts";
import { createAnthropic, VALIDATION_MODEL } from "./anthropic";
import { VALIDATION_SYSTEM_PROMPT, buildValidationUserPrompt } from "./prompts";

// Runs one candidate through Claude to decide whether it is a real issue and,
// if so, to refine it and propose a fix. The structured output is validated
// against IssueValidationSchema by the SDK's parse() helper, so a malformed or
// off-schema answer throws rather than silently corrupting the row.
//
// Returns null when the LLM is not configured (dormant) or the call fails —
// callers keep the deterministic candidate in that case, so enrichment is
// strictly additive and never a hard dependency.
export async function validateAndEnrichIssue(
  candidate: KnownIssueCandidate
): Promise<IssueValidation | null> {
  const client = createAnthropic();
  if (!client) return null;

  try {
    const response = await client.messages.parse({
      model: VALIDATION_MODEL,
      max_tokens: 1200,
      system: VALIDATION_SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildValidationUserPrompt(candidate) }],
      output_config: { format: zodOutputFormat(IssueValidationSchema) }
    });

    return response.parsed_output ?? null;
  } catch (error) {
    console.error(`[ingest] LLM validation failed for ${candidate.brand} ${candidate.model} / ${candidate.component}:`, (error as Error).message);
    return null;
  }
}

// Applies a passing validation onto a candidate, producing the row we persist.
// A rejected candidate (is_real_issue === false) returns null so the pipeline
// can drop it. Kept pure and separate from the API call so it is easy to test.
export function applyValidation(
  candidate: KnownIssueCandidate,
  validation: IssueValidation
): KnownIssueCandidate | null {
  if (!validation.is_real_issue) return null;
  return {
    ...candidate,
    issue_title: validation.refined_title,
    issue_summary: validation.refined_summary,
    severity: validation.severity,
    symptoms_to_watch: validation.symptoms_to_watch,
    preventive_action: validation.preventive_action,
    possible_solution: validation.possible_solution,
    confidence_level: validation.confidence_level
  };
}
