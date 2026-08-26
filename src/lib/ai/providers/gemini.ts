import type { AiProvider, AiCompletionRequest, AiCompletionResult } from "../types";
import { AiProviderRequestError } from "../types";

/**
 * `gemini-3.6-flash` — Google's fast, low-cost model, appropriate for
 * ORBIT's free-tier text workloads (grammar, rewriting, summaries, the
 * ORBIT AI Assistant). Only ever a *default*: override with
 * `GEMINI_MODEL` without touching this file if Google changes what's
 * current again. Confirmed live and reachable from this codebase, not
 * guessed: an initial real request against "gemini-2.0-flash" (the
 * previous default) came back 404 with Google's own error naming this
 * model as the replacement, and a follow-up real request against this
 * model returned a genuine 200 with generated text.
 *
 * Note this model is a "thinking" model — `thoughtsTokenCount` is
 * consumed from the same `maxOutputTokens` budget as the visible
 * answer, confirmed by a request that returned only
 * `finishReason: "MAX_TOKENS"` and no text at maxOutputTokens=16, then
 * real text at maxOutputTokens=500. Keep per-call `maxTokens` generous
 * enough to leave room for both.
 */
const DEFAULT_MODEL = "gemini-3.6-flash";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta";
const REQUEST_TIMEOUT_MS = 30_000;

interface GeminiCandidate {
  content?: { parts?: { text?: string }[] };
  finishReason?: string;
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
  promptFeedback?: { blockReason?: string };
}

interface GeminiErrorBody {
  error?: { code?: number; message?: string; status?: string };
}

export class GeminiProvider implements AiProvider {
  readonly id = "gemini";
  readonly configured = true;

  constructor(
    private readonly apiKey: string,
    private readonly model: string = process.env.GEMINI_MODEL || DEFAULT_MODEL,
  ) {}

  async complete(request: AiCompletionRequest): Promise<AiCompletionResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(
        `${API_BASE}/models/${encodeURIComponent(this.model)}:generateContent`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-goog-api-key": this.apiKey,
          },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: request.prompt }] }],
            ...(request.system
              ? { systemInstruction: { parts: [{ text: request.system }] } }
              : {}),
            generationConfig: {
              maxOutputTokens: request.maxTokens ?? 1024,
            },
          }),
          signal: controller.signal,
        },
      );
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new AiProviderRequestError("timeout", "The Gemini request timed out.");
      }
      throw new AiProviderRequestError(
        "network",
        `Could not reach the Gemini API: ${error instanceof Error ? error.message : "unknown network error"}`,
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as GeminiErrorBody | null;
      const message = body?.error?.message ?? `HTTP ${response.status}`;

      if (response.status === 401 || response.status === 403) {
        throw new AiProviderRequestError("invalid_key", `Gemini rejected the API key: ${message}`);
      }
      if (response.status === 429) {
        throw new AiProviderRequestError("rate_limited", `Gemini rate limit/quota exceeded: ${message}`);
      }
      if (response.status >= 500) {
        throw new AiProviderRequestError("provider_error", `Gemini server error: ${message}`);
      }
      // 400 and anything else not otherwise categorized.
      throw new AiProviderRequestError("provider_error", `Gemini request failed: ${message}`);
    }

    let data: GeminiResponse;
    try {
      data = (await response.json()) as GeminiResponse;
    } catch {
      throw new AiProviderRequestError("malformed_response", "Gemini returned a response that wasn't valid JSON.");
    }

    if (data.promptFeedback?.blockReason) {
      throw new AiProviderRequestError(
        "empty_response",
        `Gemini declined to answer (${data.promptFeedback.blockReason}).`,
      );
    }

    const text = (data.candidates ?? [])
      .flatMap((candidate) => candidate.content?.parts ?? [])
      .map((part) => part.text ?? "")
      .join("")
      .trim();

    if (!text) {
      throw new AiProviderRequestError("empty_response", "Gemini returned an empty response.");
    }

    return { text, provider: this.id, model: this.model };
  }
}
