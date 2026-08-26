import type { WebSearchProvider, WebSearchResponse } from "../types";
import { WebSearchRequestError, extractDomain } from "../types";

const API_URL = "https://api.tavily.com/search";
const REQUEST_TIMEOUT_MS = 15_000;
// Tavily's free tier is 1,000 credits/month. "basic" search costs 1
// credit/request; "advanced" costs 2. ORBIT never requests "advanced" —
// there's no code path in this provider that can send anything else,
// not just a default that happens not to be overridden.
const SEARCH_DEPTH = "basic" as const;

interface TavilyResult {
  title: string;
  url: string;
  content?: string;
  score?: number;
}

interface TavilyErrorBody {
  detail?: { error?: string } | string;
}

export class TavilyProvider implements WebSearchProvider {
  readonly id = "tavily";
  readonly configured = true;

  constructor(private readonly apiKey: string) {}

  async search(query: string, limit = 8): Promise<WebSearchResponse> {
    // Tavily's own ceiling is 20; ORBIT caps well under that regardless
    // of what a caller passes, so one search can never cost more than a
    // predictable, small number of credits.
    const maxResults = Math.min(limit, 10);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(API_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          api_key: this.apiKey,
          query,
          search_depth: SEARCH_DEPTH,
          max_results: maxResults,
          include_answer: false,
          include_images: false,
        }),
        signal: controller.signal,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new WebSearchRequestError("timeout", "The Tavily request timed out.");
      }
      throw new WebSearchRequestError(
        "network",
        `Could not reach the Tavily API: ${error instanceof Error ? error.message : "unknown network error"}`,
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as TavilyErrorBody | null;
      const detail = typeof body?.detail === "string" ? body.detail : body?.detail?.error;
      const message = detail ?? `HTTP ${response.status}`;

      if (response.status === 401 || response.status === 403) {
        throw new WebSearchRequestError("invalid_key", `Tavily rejected the API key: ${message}`);
      }
      if (response.status === 429) {
        throw new WebSearchRequestError("rate_limited", `Tavily quota/rate limit exceeded: ${message}`);
      }
      if (response.status >= 500) {
        throw new WebSearchRequestError("provider_error", `Tavily server error: ${message}`);
      }
      throw new WebSearchRequestError("provider_error", `Tavily request failed: ${message}`);
    }

    let data: { results?: TavilyResult[] };
    try {
      data = (await response.json()) as { results?: TavilyResult[] };
    } catch {
      throw new WebSearchRequestError("malformed_response", "Tavily returned a response that wasn't valid JSON.");
    }

    const results = (data.results ?? [])
      .map((r) => ({
        title: r.title,
        url: r.url,
        snippet: r.content ?? "",
        domain: extractDomain(r.url),
        score: r.score,
      }))
      // Tavily already ranks results, but sort defensively in case that
      // ever changes — never silently trust unranked ordering as ranked.
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

    return { provider: this.id, results };
  }
}
