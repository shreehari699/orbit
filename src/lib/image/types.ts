export interface ImageGenerationRequest {
  prompt: string;
  size?: "512x512" | "1024x1024" | "1792x1024" | "1024x1792";
}

export interface ImageGenerationResult {
  /** Either a hosted URL or a base64 data URI, depending on the vendor. */
  image: string;
  provider: string;
  model: string;
}

export class ImageProviderNotConfiguredError extends Error {
  constructor(providerId: string) {
    super(`Image provider "${providerId}" is not configured.`);
    this.name = "ImageProviderNotConfiguredError";
  }
}

export interface ImageProvider {
  readonly id: string;
  readonly configured: boolean;
  generate(request: ImageGenerationRequest): Promise<ImageGenerationResult>;
}
