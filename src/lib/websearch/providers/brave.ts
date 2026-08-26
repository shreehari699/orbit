import type { WebSearchProvider, WebSearchResponse } from "../types";
import { WebSearchRequestError, extractDomain } from "../types";

const API_URL = "https://api.search.brave.com/res/v1/web/search";

interface BraveWebResult {
  title: string;
  url: string;
  description?: string;
}

export class BraveSearchProvider implements WebSearchProvider {
  readonly id = "brave";
  readonly configured = true;

  constructor(private readonly apiKey: string) {}

  async search(query: string, limit = 8): Promise<WebSearchResponse> {
    const url = new URL(API_URL);
    url.searchParams.set("q", query);
    url.searchParams.set("count", String(limit));

    const response = await fetch(url, {
      headers: {
        accept: "application/json",
        "x-subscription-token": this.apiKey,
      },
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      const message = `Brave Search API error ${response.status}: ${body.slice(0, 500)}`;
      if (response.status === 401 || response.status === 403) throw new WebSearchRequestError("invalid_key", message);
      if (response.status === 429) throw new WebSearchRequestError("rate_limited", message);
      throw new WebSearchRequestError("provider_error", message);
    }

    const data = (await response.json()) as { web?: { results?: BraveWebResult[] } };
    const results = (data.web?.results ?? []).map((r) => ({
      title: r.title,
      url: r.url,
      snippet: r.description ?? "",
      domain: extractDomain(r.url),
    }));

    return { provider: this.id, results };
  }
}
