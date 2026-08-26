import { serverEnv } from "@/config/env";
import type { AiProvider, AiCompletionRequest, AiCompletionResult } from "./types";
import { AiProviderRequestError } from "./types";
import { GeminiProvider } from "./providers/gemini";
import { AnthropicProvider } from "./providers/anthropic";
import { OpenAiProvider } from "./providers/openai";
import { NullProvider } from "./providers/null";

/**
 * The AI Router — the one place that knows which vendors exist and what
 * order to try them in. Everything above this layer (the Context Engine,
 * the API route) talks to "the AI Engine", never to Gemini specifically;
 * adding a fourth provider is a one-line addition to `orderedProviders()`,
 * not a change anywhere a request is actually made.
 *
 * Gemini is preferred — it's ORBIT's initial/primary provider — then
 * Anthropic, then OpenAI. Order is deterministic and documented, not a
 * quality judgement.
 */
function orderedProviders(): AiProvider[] {
  const env = serverEnv();
  const providers: AiProvider[] = [];
  if (env.GEMINI_API_KEY) providers.push(new GeminiProvider(env.GEMINI_API_KEY));
  if (env.ANTHROPIC_API_KEY) providers.push(new AnthropicProvider(env.ANTHROPIC_API_KEY));
  if (env.OPENAI_API_KEY) providers.push(new OpenAiProvider(env.OPENAI_API_KEY));
  return providers;
}

/** True if any AI vendor is configured — the API route's "not configured" branch reads this, never a specific vendor's env var. */
export function isAiConfigured(): boolean {
  return orderedProviders().length > 0;
}

/** The provider that would be tried first — surfaced for logging/attribution, not for callers to branch on. */
export function primaryProviderId(): string {
  return orderedProviders()[0]?.id ?? "none";
}

/**
 * Runs the request against the first configured provider; on failure,
 * falls through to the next configured one rather than failing the
 * whole request on one vendor's outage or exhausted quota. Only the
 * *last* provider's error is thrown if every provider fails — the
 * caller doesn't need a list of every intermediate failure, just an
 * honest final one.
 */
export async function completeWithFallback(request: AiCompletionRequest): Promise<AiCompletionResult> {
  const providers = orderedProviders();
  if (providers.length === 0) {
    return new NullProvider().complete();
  }

  let lastError: unknown;
  for (const provider of providers) {
    try {
      return await provider.complete(request);
    } catch (error) {
      lastError = error;
      // A malformed/oversized request will fail identically on every
      // vendor — no point burning a second provider's quota on it.
      if (error instanceof AiProviderRequestError && error.kind === "oversized_input") {
        throw error;
      }
    }
  }
  throw lastError;
}
