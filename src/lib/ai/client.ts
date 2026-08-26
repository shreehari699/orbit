"use client";

import type { AiErrorKind } from "./types";

export interface AiCompleteResponse {
  configured: boolean;
  text?: string;
  provider?: string;
  model?: string;
  error?: string;
  errorKind?: AiErrorKind;
}

const NON_THROWING_STATUSES = new Set([200, 413, 429, 502, 504]);

/** Client-side helper for the `/api/ai/complete` route. Never throws on a "not configured" state or a categorized provider error — the caller checks `configured`/`error`. */
export async function requestAiCompletion(
  prompt: string,
  options?: { system?: string; maxTokens?: number },
): Promise<AiCompleteResponse> {
  const response = await fetch("/api/ai/complete", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ prompt, ...options }),
  });
  if (!NON_THROWING_STATUSES.has(response.status)) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return (await response.json()) as AiCompleteResponse;
}
