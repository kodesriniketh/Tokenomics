// lib/pricing.ts
// Manually maintained LLM pricing reference — NOT fetched live (most providers don't expose pricing via API).
// Rates are $ per 1K tokens, standard (non-batch, non-cached) tier.
// Sources: platform.claude.com/docs/pricing, developers.openai.com/api/docs/pricing, ai.google.dev/gemini-api/docs/pricing
// Last verified: 2026-07-05 — re-check quarterly, providers change pricing often.

export interface ModelPricing {
  provider: "openai" | "anthropic" | "google";
  displayName: string;
  inputPer1K: number; // $ per 1,000 input tokens
  outputPer1K: number; // $ per 1,000 output tokens
  cachedInputPer1K?: number; // $ per 1,000 cached-read input tokens (if supported)
  contextWindow: number;
  notes?: string;
}

export const PRICING: Record<string, ModelPricing> = {
  // ---- OpenAI ----
  "gpt-5.5": {
    provider: "openai",
    displayName: "GPT-5.5",
    inputPer1K: 0.0025,
    outputPer1K: 0.015,
    cachedInputPer1K: 0.00025,
    contextWindow: 400_000,
  },
  "gpt-5.4": {
    provider: "openai",
    displayName: "GPT-5.4",
    inputPer1K: 0.00125,
    outputPer1K: 0.0075,
    cachedInputPer1K: 0.000125,
    contextWindow: 400_000,
  },
  "gpt-5.4-mini": {
    provider: "openai",
    displayName: "GPT-5.4 Mini",
    inputPer1K: 0.000375,
    outputPer1K: 0.00225,
    cachedInputPer1K: 0.0000375,
    contextWindow: 400_000,
  },
  "gpt-5.4-nano": {
    provider: "openai",
    displayName: "GPT-5.4 Nano",
    inputPer1K: 0.0001,
    outputPer1K: 0.000625,
    cachedInputPer1K: 0.00001,
    contextWindow: 400_000,
  },

  // ---- Anthropic ----
  "claude-opus-4-8": {
    provider: "anthropic",
    displayName: "Claude Opus 4.8",
    inputPer1K: 0.005,
    outputPer1K: 0.025,
    cachedInputPer1K: 0.0005,
    contextWindow: 1_000_000,
  },
  "claude-sonnet-5": {
    provider: "anthropic",
    displayName: "Claude Sonnet 5",
    inputPer1K: 0.002, // introductory rate through Aug 31 2026; reverts to $0.003
    outputPer1K: 0.01, // introductory rate; reverts to $0.015
    cachedInputPer1K: 0.0003,
    contextWindow: 1_000_000,
    notes: "Introductory pricing until 2026-08-31, then $3/$15 per 1M",
  },
  "claude-haiku-4-5": {
    provider: "anthropic",
    displayName: "Claude Haiku 4.5",
    inputPer1K: 0.001,
    outputPer1K: 0.005,
    cachedInputPer1K: 0.0001,
    contextWindow: 200_000,
  },

  // ---- Google Gemini ----
  "gemini-3.5-flash": {
    provider: "google",
    displayName: "Gemini 3.5 Flash",
    inputPer1K: 0.0015,
    outputPer1K: 0.009,
    contextWindow: 1_000_000,
  },
  "gemini-3.1-pro": {
    provider: "google",
    displayName: "Gemini 3.1 Pro",
    inputPer1K: 0.002,
    outputPer1K: 0.012,
    contextWindow: 2_000_000,
    notes: "Doubles above 200K input tokens (long-context tier)",
  },
  "gemini-3.1-flash-lite": {
    provider: "google",
    displayName: "Gemini 3.1 Flash-Lite",
    inputPer1K: 0.00025,
    outputPer1K: 0.0015,
    contextWindow: 1_000_000,
  },
};

export function estimateCost(
  modelId: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const p = PRICING[modelId];
  if (!p) throw new Error(`Unknown model: ${modelId}`);
  return (
    (inputTokens / 1000) * p.inputPer1K + (outputTokens / 1000) * p.outputPer1K
  );
}
