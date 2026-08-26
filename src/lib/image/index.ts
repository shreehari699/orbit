import { serverEnv } from "@/config/env";
import type { ImageProvider } from "./types";
import { OpenAiImageProvider } from "./providers/openai-image";
import { StabilityProvider } from "./providers/stability";
import { NullImageProvider } from "./providers/null";

/**
 * Picks the first configured image-generation vendor from environment
 * variables. OpenAI Images is preferred when both are set — a
 * deterministic, documented order, not a quality judgement.
 */
export function getImageProvider(): ImageProvider {
  const env = serverEnv();
  if (env.OPENAI_IMAGE_API_KEY) return new OpenAiImageProvider(env.OPENAI_IMAGE_API_KEY);
  if (env.STABILITY_API_KEY) return new StabilityProvider(env.STABILITY_API_KEY);
  return new NullImageProvider();
}

export type { ImageProvider, ImageGenerationRequest, ImageGenerationResult } from "./types";
export { ImageProviderNotConfiguredError } from "./types";
