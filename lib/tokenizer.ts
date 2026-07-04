// lib/tokenizer.ts
// Wraps js-tiktoken for accurate token counts on OpenAI models.
// Falls back to a length/4 heuristic for models tiktoken doesn't support
// (Claude, Llama, Gemini, etc. use different tokenizers we don't have a JS lib for here).

import { encodingForModel, getEncoding, type TiktokenModel } from "js-tiktoken";

// Models js-tiktoken can map directly via encodingForModel.
// Keep this list narrow and explicit rather than trusting a try/catch to guess right.
const SUPPORTED_OPENAI_MODELS: Record<string, TiktokenModel> = {
  "gpt-4o": "gpt-4o",
  "gpt-4o-mini": "gpt-4o-mini" as TiktokenModel,
  "gpt-4": "gpt-4",
  "gpt-4-turbo": "gpt-4-turbo" as TiktokenModel,
  "gpt-3.5-turbo": "gpt-3.5-turbo",
};

// Rough chars-per-token heuristic for anything without a known tokenizer.
// English prose averages ~4 chars/token; this is intentionally approximate.
const FALLBACK_CHARS_PER_TOKEN = 4;

export function countTokens(text: string, model: string): number {
  if (!text) return 0;

  const normalizedModel = model.toLowerCase().trim();
  const tiktokenModel = SUPPORTED_OPENAI_MODELS[normalizedModel];

  if (tiktokenModel) {
    try {
      const enc = encodingForModel(tiktokenModel);
      return enc.encode(text).length;
    } catch (err) {
      console.error(
        `[countTokens] tiktoken encoding failed for model "${model}", falling back to estimate:`,
        err,
      );
      return estimateTokens(text);
    }
  }

  // Known non-OpenAI models — no tiktoken support, use estimate deliberately (not an error case)
  if (isKnownNonTiktokenModel(normalizedModel)) {
    return estimateTokens(text);
  }

  // Unknown model entirely — still return an estimate rather than throwing,
  // since the UI should degrade gracefully, but log so we notice gaps.
  console.warn(
    `[countTokens] Unrecognized model "${model}", using fallback estimate.`,
  );
  return estimateTokens(text);
}

function isKnownNonTiktokenModel(model: string): boolean {
  return (
    model.includes("claude") ||
    model.includes("llama") ||
    model.includes("gemini") ||
    model.includes("mistral")
  );
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / FALLBACK_CHARS_PER_TOKEN);
}
