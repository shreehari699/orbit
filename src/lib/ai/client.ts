"use client";

import type { AiErrorKind } from "./types";
import type { TaskId } from "./engine";

export interface AiCompleteResponse {
  configured: boolean;
  text?: string;
  provider?: string;
  model?: string;
  error?: string;
  errorKind?: AiErrorKind;
}

const NON_THROWING_STATUSES = new Set([200, 400, 413, 429, 502, 504]);

/** Client-side helper for the `/api/ai/complete` route — the only place any tool sends a `taskId` + typed input; the actual AI instructions live server-side in the Task registry, never in this request body. Never throws on a "not configured" state or a categorized provider error — the caller checks `configured`/`error`. */
export async function requestAiTask(taskId: TaskId, input: unknown): Promise<AiCompleteResponse> {
  const response = await fetch("/api/ai/complete", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ taskId, input }),
  });
  if (!NON_THROWING_STATUSES.has(response.status)) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return (await response.json()) as AiCompleteResponse;
}
