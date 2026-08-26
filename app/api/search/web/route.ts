import { NextResponse } from "next/server";

import { getWebSearchProvider, WebSearchNotConfiguredError } from "@/lib/websearch";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { query?: string } | null;

  if (!body?.query || typeof body.query !== "string") {
    return NextResponse.json({ error: "A `query` string is required." }, { status: 400 });
  }

  const provider = getWebSearchProvider();

  if (!provider.configured) {
    return NextResponse.json({ configured: false }, { status: 200 });
  }

  try {
    const result = await provider.search(body.query);
    return NextResponse.json({ configured: true, ...result });
  } catch (error) {
    if (error instanceof WebSearchNotConfiguredError) {
      return NextResponse.json({ configured: false }, { status: 200 });
    }
    console.error("[api/search/web] provider error:", error);
    return NextResponse.json(
      { configured: true, error: "The web search request failed." },
      { status: 502 },
    );
  }
}
