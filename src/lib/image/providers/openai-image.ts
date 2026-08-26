import type { ImageProvider, ImageGenerationRequest, ImageGenerationResult } from "../types";

const DEFAULT_MODEL = "dall-e-3";
const API_URL = "https://api.openai.com/v1/images/generations";

export class OpenAiImageProvider implements ImageProvider {
  readonly id = "openai-image";
  readonly configured = true;

  constructor(
    private readonly apiKey: string,
    private readonly model: string = process.env.OPENAI_IMAGE_MODEL || DEFAULT_MODEL,
  ) {}

  async generate(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        prompt: request.prompt,
        size: request.size ?? "1024x1024",
        n: 1,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`OpenAI Images API error ${response.status}: ${body.slice(0, 500)}`);
    }

    const data = (await response.json()) as { data?: { url?: string }[] };
    const url = data.data?.[0]?.url;
    if (!url) throw new Error("OpenAI Images API returned no image URL.");

    return { image: url, provider: this.id, model: this.model };
  }
}
