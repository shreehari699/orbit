import type { AiProvider, AiCompletionRequest, AiCompletionResult } from "../types";

const DEFAULT_MODEL = "claude-3-5-haiku-latest";
const API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

/**
 * Talks to the Anthropic Messages API directly (no SDK dependency, to keep
 * ORBIT's footprint small). Only ever instantiated when
 * `ANTHROPIC_API_KEY` is set — see `getAiProvider()`.
 */
export class AnthropicProvider implements AiProvider {
  readonly id = "anthropic";
  readonly configured = true;

  constructor(
    private readonly apiKey: string,
    private readonly model: string = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
  ) {}

  async complete(request: AiCompletionRequest): Promise<AiCompletionResult> {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: request.maxTokens ?? 1024,
        system: request.system,
        messages: [{ role: "user", content: request.prompt }],
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`Anthropic API error ${response.status}: ${body.slice(0, 500)}`);
    }

    const data = (await response.json()) as {
      content?: { type: string; text?: string }[];
      model?: string;
    };

    const text = (data.content ?? [])
      .filter((block) => block.type === "text" && block.text)
      .map((block) => block.text)
      .join("\n");

    return { text, provider: this.id, model: data.model ?? this.model };
  }
}
