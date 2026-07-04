import { NextRequest, NextResponse } from "next/server";
import { PRICING } from "../../../lib/pricing";
import { countTokens } from "../../../lib/tokenizer";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    if (!rawBody.trim()) {
      return NextResponse.json(
        { error: "Body must include { prompt: string }" },
        { status: 400 },
      );
    }

    let body: unknown;

    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Body must be valid JSON" },
        { status: 400 },
      );
    }

    const prompt =
      typeof body === "object" &&
      body !== null &&
      "prompt" in body &&
      typeof (body as { prompt?: unknown }).prompt === "string"
        ? (body as { prompt: string }).prompt
        : "";

    if (!prompt.trim()) {
      return NextResponse.json(
        { error: "Body must include { prompt: string }" },
        { status: 400 },
      );
    }

    const estimates = Object.entries(PRICING)
      .map(([model, pricing]) => {
        const tokens = countTokens(prompt, model);
        const costUSD = Number(
          ((tokens / 1000) * pricing.inputPer1K).toFixed(6),
        );

        return { model, tokens, costUSD };
      })
      .sort((a, b) => a.costUSD - b.costUSD);

    return NextResponse.json(estimates);
  } catch (error) {
    console.error("[/api/estimate] error:", error);
    return NextResponse.json(
      { error: "Failed to estimate costs" },
      { status: 500 },
    );
  }
}
