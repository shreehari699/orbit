import { NextResponse } from "next/server";

import { getAiProvider, ProviderNotConfiguredError, AiProviderRequestError } from "@/lib/ai";
import { checkRateLimit, getClientKey } from "@/lib/rate-limit";
import type { AiErrorKind } from "@/lib/ai";

const MAX_PROMPT_LENGTH = 20_000;
// Confirmed live against Gemini's free tier during testing: the whole
// project (this API key) is capped at 20 generateContent requests/minute
// — a project-wide budget, not per-user. A per-client limit equal to
// that would let one active person exhaust it for everyone else, so
// this is deliberately well under it, leaving headroom for concurrent
// users on the shared free-tier quota.
const RATE_LIMIT = { limit: 6, windowMs: 60_000 };

const ERROR_MESSAGES: Record<AiErrorKind, string> = {
  invalid_key: "The AI provider rejected its API key. This is a server configuration issue, not something you can fix here.",
  rate_limited: "AI usage limit reached. Please try again later.",
  timeout: "The AI provider took too long to respond. Please try again.",
  network: "Couldn't reach the AI provider. Please try again in a moment.",
  provider_error: "The AI provider had an error processing this request. Please try again.",
  empty_response: "The AI provider returned an empty response. Please try rephrasing your request.",
  malformed_response: "The AI provider returned an unexpected response. Please try again.",
  oversized_input: "That input is too long for ORBIT's AI tools right now.",
};

export async function POST(request: Request) {
  const clientKey = getClientKey(request);
  const rateLimit = checkRateLimit(`ai:${clientKey}`, RATE_LIMIT);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { configured: true, error: ERROR_MESSAGES.rate_limited, errorKind: "rate_limited" satisfies AiErrorKind },
      { status: 429, headers: { "retry-after": String(rateLimit.retryAfterSeconds) } },
    );
  }

  const body = (await request.json().catch(() => null)) as
    | { prompt?: string; system?: string; maxTokens?: number }
    | null;

  if (!body?.prompt || typeof body.prompt !== "string" || !body.prompt.trim()) {
    return NextResponse.json({ error: "A non-empty `prompt` string is required." }, { status: 400 });
  }
  if (body.prompt.length > MAX_PROMPT_LENGTH) {
    return NextResponse.json(
      { configured: true, error: ERROR_MESSAGES.oversized_input, errorKind: "oversized_input" satisfies AiErrorKind },
      { status: 413 },
    );
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
    if (error instanceof AiProviderRequestError) {
      // Log the real error server-side for diagnosis; never forward the
      // provider's raw message (it can echo request fragments) to the client.
      console.error(`[api/ai/complete] ${error.kind}:`, error.message);
      const status = error.kind === "rate_limited" ? 429 : error.kind === "timeout" ? 504 : 502;
      return NextResponse.json(
        { configured: true, error: ERROR_MESSAGES[error.kind], errorKind: error.kind },
        { status },
      );
    }
    console.error("[api/ai/complete] unexpected error:", error);
    return NextResponse.json(
      { configured: true, error: ERROR_MESSAGES.provider_error, errorKind: "provider_error" satisfies AiErrorKind },
      { status: 502 },
    );
  }
}
