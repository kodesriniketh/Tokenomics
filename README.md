# Tokenomics

**Estimate, compare, and optimize LLM token costs before you spend a single API call.**

Tokenomics is a developer tool that analyzes a prompt and estimates its token count and dollar cost across multiple LLM providers (OpenAI, Anthropic, Google) — before you send it. Built for teams and solo developers running AI workloads at scale who want visibility into cost *before* it hits their bill, not after.

## Why

Most teams find out their LLM costs are too high from an invoice, not a dashboard. Tokenomics moves that feedback loop to design time: paste a prompt, see what it costs on every major model, and pick the cheapest one that clears your quality bar — before you write a single line of integration code.

## Features

- **Multi-model cost estimation** — one prompt, ranked cost comparison across OpenAI, Anthropic, and Google Gemini models
- **Accurate tokenization** — real tiktoken-based counts for OpenAI models, with a documented fallback estimate for providers without a public JS tokenizer (Claude, Gemini, Llama)
- **Cost-ascending ranking** — instantly see which model is cheapest for a given prompt, not just which is "popular"
- **Maintained pricing table** — manually verified, versioned pricing data (see [Pricing data](#pricing-data) below) rather than a stale hardcoded guess
- 🚧 **Prompt compression** *(planned)* — suggest trimmed/restructured prompts that preserve intent while reducing token count
- 🚧 **Usage analytics** *(planned)* — track estimated vs. actual spend over time
- 🚧 **Optimization recommendations** *(planned)* — flag when a cheaper model would likely produce comparable output quality

## Tech stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Tokenization:** [js-tiktoken](https://github.com/dqbd/tiktoken) for OpenAI models
- **Pricing data:** manually maintained, not fetched live (see below)

## Getting started

```bash
git clone https://github.com/<your-username>/tokenomics.git
cd tokenomics
npm install
npm run dev
```

Visit `http://localhost:3000`.

## API

### `POST /api/estimate`

Estimates input token count and cost across every model in the pricing table.

**Request:**
```json
{
  "prompt": "Explain the difference between TCP and UDP in three sentences."
}
```

**Response:**
```json
[
  { "model": "gpt-5.4-nano", "displayName": "GPT-5.4 Nano", "tokens": 14, "costUSD": 0.0000014 },
  { "model": "claude-haiku-4-5", "displayName": "Claude Haiku 4.5", "tokens": 15, "costUSD": 0.000015 },
  { "model": "gemini-3.1-pro", "displayName": "Gemini 3.1 Pro", "tokens": 15, "costUSD": 0.00003 }
]
```

Sorted cheapest to most expensive. Currently estimates **input cost only** — output cost depends on response length, which isn't known until generation, so it's intentionally left out rather than guessed.

## Pricing data

Pricing lives in `lib/pricing.ts` as a manually maintained, versioned table rather than a live API call — no major provider exposes pricing programmatically. Each entry is sourced directly from official provider docs and stamped with a last-verified date. This is a deliberate design choice, not a shortcut: providers change pricing frequently enough that automated scraping would be fragile, and a documented manual table is the same approach used by production cost-tracking tools like Helicone and OpenRouter.

**Update cadence:** quarterly, or when a provider announces a pricing change.

## Project structure
