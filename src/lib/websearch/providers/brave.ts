import type { WebSearchProvider, WebSearchResponse } from "../types";

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
      throw new Error(`Brave Search API error ${response.status}: ${body.slice(0, 500)}`);
    }

    const data = (await response.json()) as { web?: { results?: BraveWebResult[] } };
    const results = (data.web?.results ?? []).map((r) => ({
      title: r.title,
      url: r.url,
      snippet: r.description ?? "",
    }));

    return { provider: this.id, results };
  }
}
