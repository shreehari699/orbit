import type { WebSearchProvider, WebSearchResponse } from "../types";
import { WebSearchRequestError, extractDomain } from "../types";

const API_URL = "https://google.serper.dev/search";

interface SerperOrganicResult {
  title: string;
  link: string;
  snippet?: string;
}

export class SerperSearchProvider implements WebSearchProvider {
  readonly id = "serper";
  readonly configured = true;

  constructor(private readonly apiKey: string) {}

  async search(query: string, limit = 8): Promise<WebSearchResponse> {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.apiKey,
      },
      body: JSON.stringify({ q: query, num: limit }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      const message = `Serper API error ${response.status}: ${body.slice(0, 500)}`;
      if (response.status === 401 || response.status === 403) throw new WebSearchRequestError("invalid_key", message);
      if (response.status === 429) throw new WebSearchRequestError("rate_limited", message);
      throw new WebSearchRequestError("provider_error", message);
    }

    const data = (await response.json()) as { organic?: SerperOrganicResult[] };
    const results = (data.organic ?? []).map((r) => ({
      title: r.title,
      url: r.link,
      snippet: r.snippet ?? "",
      domain: extractDomain(r.link),
    }));

    return { provider: this.id, results };
  }
}
