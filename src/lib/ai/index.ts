import { serverEnv } from "@/config/env";
import type { AiProvider } from "./types";
import { GeminiProvider } from "./providers/gemini";
import { AnthropicProvider } from "./providers/anthropic";
import { OpenAiProvider } from "./providers/openai";
import { NullProvider } from "./providers/null";

/**
 * Picks the first configured AI vendor from environment variables.
 * Gemini is preferred when set — it's ORBIT's initial provider — then
 * Anthropic, then OpenAI. A deterministic, documented order, not a
 * quality judgement; changing it is a one-line edit here, nowhere else.
 */
export function getAiProvider(): AiProvider {
  const env = serverEnv();
  if (env.GEMINI_API_KEY) return new GeminiProvider(env.GEMINI_API_KEY);
  if (env.ANTHROPIC_API_KEY) return new AnthropicProvider(env.ANTHROPIC_API_KEY);
  if (env.OPENAI_API_KEY) return new OpenAiProvider(env.OPENAI_API_KEY);
  return new NullProvider();
}

export type { AiProvider, AiCompletionRequest, AiCompletionResult, AiErrorKind } from "./types";
export { ProviderNotConfiguredError, AiProviderRequestError } from "./types";
