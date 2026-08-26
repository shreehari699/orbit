import type { AiProvider, AiCompletionRequest, AiCompletionResult } from "../types";

const DEFAULT_MODEL = "gpt-4o-mini";
const API_URL = "https://api.openai.com/v1/chat/completions";

/**
 * Talks to the OpenAI Chat Completions API directly. Only ever
 * instantiated when `OPENAI_API_KEY` is set — see `getAiProvider()`.
 */
export class OpenAiProvider implements AiProvider {
  readonly id = "openai";
  readonly configured = true;

  constructor(
    private readonly apiKey: string,
    private readonly model: string = process.env.OPENAI_MODEL || DEFAULT_MODEL,
  ) {}

  async complete(request: AiCompletionRequest): Promise<AiCompletionResult> {
    const messages = [
      ...(request.system ? [{ role: "system", content: request.system }] : []),
      { role: "user", content: request.prompt },
    ];

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: request.maxTokens ?? 1024,
        messages,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`OpenAI API error ${response.status}: ${body.slice(0, 500)}`);
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
      model?: string;
    };

    const text = data.choices?.[0]?.message?.content ?? "";
    return { text, provider: this.id, model: data.model ?? this.model };
  }
}
