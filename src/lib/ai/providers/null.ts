import type { AiProvider, AiCompletionResult } from "../types";
import { ProviderNotConfiguredError } from "../types";

/**
 * The fallback when no AI provider is configured. Callers must check
 * `configured` and render an honest "connect a provider" state — this
 * class exists so that path is a real branch in the type system, not an
 * afterthought, and so `complete()` fails loudly instead of ever being
 * mistaken for a working call.
 */
export class NullProvider implements AiProvider {
  readonly id = "none";
  readonly configured = false;

  async complete(): Promise<AiCompletionResult> {
    throw new ProviderNotConfiguredError(this.id);
  }
}
