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

export interface AiProvider {
  readonly id: string;
  readonly configured: boolean;
  complete(request: AiCompletionRequest): Promise<AiCompletionResult>;
}
