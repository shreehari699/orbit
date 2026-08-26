"use client";

export interface AiCompleteResponse {
  configured: boolean;
  text?: string;
  provider?: string;
  model?: string;
  error?: string;
}

/** Client-side helper for the `/api/ai/complete` route. Never throws on a "not configured" state — the caller checks `configured`. */
export async function requestAiCompletion(
  prompt: string,
  options?: { system?: string; maxTokens?: number },
): Promise<AiCompleteResponse> {
  const response = await fetch("/api/ai/complete", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ prompt, ...options }),
  });
  if (!response.ok && response.status !== 502) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return (await response.json()) as AiCompleteResponse;
}
