import { NextResponse } from "next/server";

import { getImageProvider, ImageProviderNotConfiguredError } from "@/lib/image";
import { checkRateLimit, getClientKey } from "@/lib/rate-limit";

const MAX_PROMPT_LENGTH = 2_000;
const RATE_LIMIT = { limit: 10, windowMs: 60_000 };

export async function POST(request: Request) {
  const clientKey = getClientKey(request);
  const rateLimit = checkRateLimit(`image:${clientKey}`, RATE_LIMIT);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { configured: true, error: "AI usage limit reached. Please try again later." },
      { status: 429, headers: { "retry-after": String(rateLimit.retryAfterSeconds) } },
    );
  }

  const body = (await request.json().catch(() => null)) as
    | { prompt?: string; size?: "512x512" | "1024x1024" | "1792x1024" | "1024x1792" }
    | null;

  if (!body?.prompt || typeof body.prompt !== "string" || !body.prompt.trim()) {
    return NextResponse.json({ error: "A non-empty `prompt` string is required." }, { status: 400 });
  }
  if (body.prompt.length > MAX_PROMPT_LENGTH) {
    return NextResponse.json({ error: "That prompt is too long." }, { status: 413 });
  }

  const provider = getImageProvider();

  if (!provider.configured) {
    return NextResponse.json({ configured: false }, { status: 200 });
  }

  try {
    const result = await provider.generate({ prompt: body.prompt, size: body.size });
    return NextResponse.json({ configured: true, ...result });
  } catch (error) {
    if (error instanceof ImageProviderNotConfiguredError) {
      return NextResponse.json({ configured: false }, { status: 200 });
    }
    console.error("[api/ai/image] provider error:", error);
    return NextResponse.json(
      { configured: true, error: "The image provider request failed." },
      { status: 502 },
    );
  }
}
