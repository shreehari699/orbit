"use client";

import type { WebSearchResult, WebSearchErrorKind } from "./types";

export interface WebSearchClientResponse {
  configured: boolean;
  provider?: string;
  results?: WebSearchResult[];
  error?: string;
  errorKind?: WebSearchErrorKind;
}

const NON_THROWING_STATUSES = new Set([200, 400, 413, 429, 502, 504]);

export async function requestWebSearch(query: string): Promise<WebSearchClientResponse> {
  const response = await fetch("/api/search/web", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!NON_THROWING_STATUSES.has(response.status)) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return (await response.json()) as WebSearchClientResponse;
}
