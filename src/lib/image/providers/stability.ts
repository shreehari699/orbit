import type { ImageProvider, ImageGenerationRequest, ImageGenerationResult } from "../types";

const DEFAULT_ENGINE = "stable-diffusion-xl-1024-v1-0";

export class StabilityProvider implements ImageProvider {
  readonly id = "stability";
  readonly configured = true;

  constructor(
    private readonly apiKey: string,
    private readonly engine: string = process.env.STABILITY_ENGINE || DEFAULT_ENGINE,
  ) {}

  async generate(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
    const [width, height] = (request.size ?? "1024x1024").split("x").map(Number);

    const response = await fetch(
      `https://api.stability.ai/v1/generation/${this.engine}/text-to-image`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
          authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          text_prompts: [{ text: request.prompt }],
          width,
          height,
          samples: 1,
        }),
      },
    );

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`Stability API error ${response.status}: ${body.slice(0, 500)}`);
    }

    const data = (await response.json()) as { artifacts?: { base64?: string }[] };
    const base64 = data.artifacts?.[0]?.base64;
    if (!base64) throw new Error("Stability API returned no image data.");

    return {
      image: `data:image/png;base64,${base64}`,
      provider: this.id,
      model: this.engine,
    };
  }
}
