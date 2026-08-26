import { NextResponse } from "next/server";

import { getAiProvider, ProviderNotConfiguredError } from "@/lib/ai";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { prompt?: string; system?: string; maxTokens?: number }
    | null;

  if (!body?.prompt || typeof body.prompt !== "string") {
    return NextResponse.json({ error: "A `prompt` string is required." }, { status: 400 });
  }

  const provider = getAiProvider();

  if (!provider.configured) {
    return NextResponse.json({ configured: false }, { status: 200 });
  }

  try {
    const result = await provider.complete({
      prompt: body.prompt,
      system: body.system,
      maxTokens: body.maxTokens,
    });
    return NextResponse.json({ configured: true, ...result });
  } catch (error) {
    if (error instanceof ProviderNotConfiguredError) {
      return NextResponse.json({ configured: false }, { status: 200 });
    }
    console.error("[api/ai/complete] provider error:", error);
    return NextResponse.json(
      { configured: true, error: "The AI provider request failed." },
      { status: 502 },
    );
  }
}
