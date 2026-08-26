import { serverEnv } from "@/config/env";
import type { WebSearchProvider } from "./types";
import { BraveSearchProvider } from "./providers/brave";
import { SerperSearchProvider } from "./providers/serper";
import { NullWebSearchProvider } from "./providers/null";

/**
 * Picks the first configured web-search vendor from environment
 * variables. Brave is preferred when both are set — a deterministic,
 * documented order. With neither configured, ORBIT's own tool/document
 * search still works; only the "Web" results section is affected.
 */
export function getWebSearchProvider(): WebSearchProvider {
  const env = serverEnv();
  if (env.BRAVE_SEARCH_API_KEY) return new BraveSearchProvider(env.BRAVE_SEARCH_API_KEY);
  if (env.SERPER_API_KEY) return new SerperSearchProvider(env.SERPER_API_KEY);
  return new NullWebSearchProvider();
}

export type { WebSearchProvider, WebSearchResult, WebSearchResponse } from "./types";
export { WebSearchNotConfiguredError } from "./types";
