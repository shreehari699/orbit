export interface AiCompletionRequest {
  prompt: string;
  system?: string;
  maxTokens?: number;
}

export interface AiCompletionResult {
  text: string;
  provider: string;
  model: string;
}

export class ProviderNotConfiguredError extends Error {
  constructor(providerId: string) {
    super(`AI provider "${providerId}" is not configured.`);
    this.name = "ProviderNotConfiguredError";
  }
}

/**
 * The failure categories every provider maps its own errors onto, so the
 * API route (and eventually the UI) can show one honest, specific message
 * per kind instead of a single generic "something went wrong" — and so a
 * raw provider error body (which can include request fragments) is never
 * forwarded to the client.
 */
export type AiErrorKind =
  | "invalid_key"
  | "rate_limited"
  | "timeout"
  | "network"
  | "provider_error"
  | "empty_response"
  | "malformed_response"
  | "oversized_input";

export class AiProviderRequestError extends Error {
  constructor(
    public readonly kind: AiErrorKind,
    message: string,
  ) {
    super(message);
    this.name = "AiProviderRequestError";
  }
}

export interface AiProvider {
  readonly id: string;
  readonly configured: boolean;
  complete(request: AiCompletionRequest): Promise<AiCompletionResult>;
}
