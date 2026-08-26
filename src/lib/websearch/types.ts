export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  /** Hostname extracted from `url` (e.g. "developer.mozilla.org") — shown as the source next to each result. */
  domain: string;
  /** Provider-reported relevance, when available (Tavily returns one; Brave/Serper don't). Higher is more relevant. */
  score?: number;
}

export interface WebSearchResponse {
  provider: string;
  results: WebSearchResult[];
}

export class WebSearchNotConfiguredError extends Error {
  constructor(providerId: string) {
    super(`Web search provider "${providerId}" is not configured.`);
    this.name = "WebSearchNotConfiguredError";
  }
}

/**
 * The failure categories every web-search provider maps its own errors
 * onto — same shape as `AiErrorKind` in `src/lib/ai/types.ts`, so the
 * "Web" results section and ORBIT's AI tools show errors the same way
 * rather than each inventing its own vocabulary.
 */
export type WebSearchErrorKind = "invalid_key" | "rate_limited" | "timeout" | "network" | "provider_error" | "malformed_response";

export class WebSearchRequestError extends Error {
  constructor(
    public readonly kind: WebSearchErrorKind,
    message: string,
  ) {
    super(message);
    this.name = "WebSearchRequestError";
  }
}

export interface WebSearchProvider {
  readonly id: string;
  readonly configured: boolean;
  search(query: string, limit?: number): Promise<WebSearchResponse>;
}

/** Best-effort hostname extraction — never throws on a malformed URL, just falls back to the raw string. */
export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
