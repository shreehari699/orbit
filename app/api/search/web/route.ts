import { NextResponse } from "next/server";

import { getWebSearchProvider, WebSearchNotConfiguredError, WebSearchRequestError } from "@/lib/websearch";
import type { WebSearchErrorKind } from "@/lib/websearch";
import { checkRateLimit, getClientKey } from "@/lib/rate-limit";

const MAX_QUERY_LENGTH = 500;
// Tavily's free tier is 1,000 credits/month, 1 credit per "basic"
// search. This limit protects that monthly budget from one client
// looping requests — it isn't meant to be hit in normal use.
const RATE_LIMIT = { limit: 10, windowMs: 60_000 };

const ERROR_MESSAGES: Record<WebSearchErrorKind, string> = {
  invalid_key: "The web search provider rejected its API key. This is a server configuration issue, not something you can fix here.",
  rate_limited: "Web search limit reached. Please try again later.",
  timeout: "The web search provider took too long to respond. Please try again.",
  network: "Couldn't reach the web search provider. Please try again in a moment.",
  provider_error: "The web search provider had an error processing this request. Please try again.",
  malformed_response: "The web search provider returned an unexpected response. Please try again.",
};

export async function POST(request: Request) {
  const clientKey = getClientKey(request);
  const rateLimit = checkRateLimit(`websearch:${clientKey}`, RATE_LIMIT);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { configured: true, error: ERROR_MESSAGES.rate_limited, errorKind: "rate_limited" satisfies WebSearchErrorKind },
      { status: 429, headers: { "retry-after": String(rateLimit.retryAfterSeconds) } },
    );
  }

  const body = (await request.json().catch(() => null)) as { query?: string } | null;

  if (!body?.query || typeof body.query !== "string" || !body.query.trim()) {
    return NextResponse.json({ error: "A non-empty `query` string is required." }, { status: 400 });
  }
  if (body.query.length > MAX_QUERY_LENGTH) {
    return NextResponse.json({ error: "That query is too long." }, { status: 413 });
  }

  const provider = getWebSearchProvider();

  if (!provider.configured) {
    return NextResponse.json({ configured: false }, { status: 200 });
  }

  try {
    // A sensible, fixed maximum — never derived from client input, so a
    // request body can't inflate credit usage per search.
    const result = await provider.search(body.query, 8);
    return NextResponse.json({ configured: true, ...result });
  } catch (error) {
    if (error instanceof WebSearchNotConfiguredError) {
      return NextResponse.json({ configured: false }, { status: 200 });
    }
    if (error instanceof WebSearchRequestError) {
      console.error(`[api/search/web] ${error.kind}:`, error.message);
      const status = error.kind === "rate_limited" ? 429 : error.kind === "timeout" ? 504 : 502;
      return NextResponse.json(
        { configured: true, error: ERROR_MESSAGES[error.kind], errorKind: error.kind },
        { status },
      );
    }
    console.error("[api/search/web] unexpected error:", error);
    return NextResponse.json(
      { configured: true, error: ERROR_MESSAGES.provider_error, errorKind: "provider_error" satisfies WebSearchErrorKind },
      { status: 502 },
    );
  }
}
