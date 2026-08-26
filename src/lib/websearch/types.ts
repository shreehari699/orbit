export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
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

export interface WebSearchProvider {
  readonly id: string;
  readonly configured: boolean;
  search(query: string, limit?: number): Promise<WebSearchResponse>;
}
