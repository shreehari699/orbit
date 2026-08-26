"use client";

import type { WebSearchResult } from "./types";

export interface WebSearchClientResponse {
  configured: boolean;
  provider?: string;
  results?: WebSearchResult[];
  error?: string;
}

export async function requestWebSearch(query: string): Promise<WebSearchClientResponse> {
  const response = await fetch("/api/search/web", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!response.ok && response.status !== 502) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return (await response.json()) as WebSearchClientResponse;
}
