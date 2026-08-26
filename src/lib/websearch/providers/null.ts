import type { WebSearchProvider, WebSearchResponse } from "../types";
import { WebSearchNotConfiguredError } from "../types";

export class NullWebSearchProvider implements WebSearchProvider {
  readonly id = "none";
  readonly configured = false;

  async search(): Promise<WebSearchResponse> {
    throw new WebSearchNotConfiguredError(this.id);
  }
}
