import { serverEnv } from "@/config/env";
import type { AiProvider } from "./types";
import { AnthropicProvider } from "./providers/anthropic";
import { OpenAiProvider } from "./providers/openai";
import { NullProvider } from "./providers/null";

/**
 * Picks the first configured AI vendor from environment variables.
 * Anthropic is preferred when both are set — no functional reason beyond
 * a deterministic, documented order. Server-only: reads `serverEnv()`.
 */
export function getAiProvider(): AiProvider {
  const env = serverEnv();
  if (env.ANTHROPIC_API_KEY) return new AnthropicProvider(env.ANTHROPIC_API_KEY);
  if (env.OPENAI_API_KEY) return new OpenAiProvider(env.OPENAI_API_KEY);
  return new NullProvider();
}

export type { AiProvider, AiCompletionRequest, AiCompletionResult } from "./types";
export { ProviderNotConfiguredError } from "./types";
