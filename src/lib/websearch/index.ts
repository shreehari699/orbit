import { serverEnv } from "@/config/env";
import type { WebSearchProvider } from "./types";
import { TavilyProvider } from "./providers/tavily";
import { BraveSearchProvider } from "./providers/brave";
import { SerperSearchProvider } from "./providers/serper";
import { NullWebSearchProvider } from "./providers/null";

/**
 * Picks the first configured web-search vendor from environment
 * variables. Tavily is ORBIT V1's primary provider — preferred when
 * set — then Brave, then Serper: a deterministic, documented order, not
 * a quality judgement. With none configured, ORBIT's own tool/document
 * search still works; only the "Web" results section is affected.
 */
export function getWebSearchProvider(): WebSearchProvider {
  const env = serverEnv();
  if (env.TAVILY_API_KEY) return new TavilyProvider(env.TAVILY_API_KEY);
  if (env.BRAVE_SEARCH_API_KEY) return new BraveSearchProvider(env.BRAVE_SEARCH_API_KEY);
  if (env.SERPER_API_KEY) return new SerperSearchProvider(env.SERPER_API_KEY);
  return new NullWebSearchProvider();
}

export type { WebSearchProvider, WebSearchResult, WebSearchResponse, WebSearchErrorKind } from "./types";
export { WebSearchNotConfiguredError, WebSearchRequestError } from "./types";
