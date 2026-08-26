import { z } from "zod";

import { TOOLS } from "@/registry/tools";
import { getZeroDegreeApps } from "@/registry/apps";
import type { AiCompletionRequest } from "../types";

const MAX_TEXT = 20_000;
const MAX_QUESTION = 2_000;
const MAX_DOCUMENT = 24_000;

const textSchema = z.string().trim().min(1).max(MAX_TEXT);

/**
 * Every AI-backed capability ORBIT offers, as one schema-validated task
 * per capability — the "Tool Registry" layer of the AI Engine. The
 * client sends a `taskId` and typed `input`, never a free-form system
 * prompt: the actual instructions live only here, server-side, so a
 * tampered request body can change what text gets summarized but can't
 * change the instruction to "ignore grounding and make something up".
 */
export const TASK_SCHEMAS = {
  grammar: z.object({ text: textSchema }),
  rewrite: z.object({ text: textSchema }),
  paraphrase: z.object({ text: textSchema }),
  summarize: z.object({ text: textSchema, style: z.enum(["bullets", "paragraph"]) }),
  tone: z.object({ text: textSchema, tone: z.string().trim().min(1).max(40) }),
  email: z.object({ description: textSchema, tone: z.string().trim().min(1).max(40) }),
  "pdf-summary": z.object({ documentText: z.string().trim().min(1).max(MAX_DOCUMENT) }),
  "pdf-qa": z.object({
    documentText: z.string().trim().min(1).max(MAX_DOCUMENT),
    question: z.string().trim().min(1).max(MAX_QUESTION),
  }),
  "assistant-chat": z.object({
    conversation: z
      .array(
        z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string().trim().min(1).max(4000),
        }),
      )
      .min(1)
      .max(30),
  }),
} satisfies Record<string, z.ZodType>;

export type TaskId = keyof typeof TASK_SCHEMAS;
export type TaskInput<T extends TaskId> = z.infer<(typeof TASK_SCHEMAS)[T]>;

export class TaskValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TaskValidationError";
  }
}

/** Validates raw (untrusted, client-supplied) input against a task's schema. */
export function validateTaskInput<T extends TaskId>(taskId: T, raw: unknown): TaskInput<T> {
  const result = TASK_SCHEMAS[taskId].safeParse(raw);
  if (!result.success) {
    throw new TaskValidationError(result.error.issues.map((i) => i.message).join("; "));
  }
  return result.data as TaskInput<T>;
}

function groundedDocumentSystemPrompt(documentText: string): string {
  return [
    "You answer questions about ONE document, and ONLY from that document's content below.",
    "Never use outside/general knowledge to fill gaps.",
    'If the answer is not in the document, say plainly: "This isn\'t covered in the document." Do not guess.',
    "When you do answer, cite the page it came from in the form (p. N) using the [Page N] markers in the text.",
    "",
    "--- DOCUMENT START ---",
    documentText.slice(0, MAX_DOCUMENT),
    "--- DOCUMENT END ---",
  ].join("\n");
}

function assistantSystemPrompt(): string {
  const toolLines = TOOLS.map((t) => `- ${t.label} (${t.href}): ${t.description}`).join("\n");
  const appLines = getZeroDegreeApps()
    .map((a) => `- ${a.name}${a.self ? " (this app)" : ""}: ${a.tagline} — ${a.url ? "connected" : "not connected yet"}`)
    .join("\n");

  return [
    "You are the ORBIT AI Assistant, built into Zero Degree's ORBIT workspace.",
    "Your job is to help the user find and understand ORBIT's own tools and the Zero Degree app family — not to be a general-purpose chatbot.",
    "",
    "ORBIT's tools (id — route — description):",
    toolLines,
    "",
    "Zero Degree apps:",
    appLines,
    "",
    "Rules:",
    "1. For anything answerable by a deterministic ORBIT tool (unit/date/percentage conversion, JSON formatting, text case, word counts, file conversion, calculators, etc.), tell the user which tool does it and point them to its route — do NOT compute the answer yourself, even if you could.",
    "2. You have no ability to open pages, run tools, or touch files. Never say you performed an action, compressed a file, converted anything, or navigated anywhere — you can only suggest one navigation target for the user to click.",
    "3. If nothing in ORBIT fits the request, say so honestly rather than inventing a tool or route that doesn't exist above.",
    "4. Keep replies short — 1-3 sentences.",
    "",
    "You MUST respond with ONLY a single JSON object, no other text, matching exactly this shape:",
    '{"reply": "<your short reply text>", "action": {"type": "navigate", "href": "<one of the routes above>", "label": "<short button label>"} | null}',
    'Set "action" to null when there\'s no single relevant tool/app to point to.',
  ].join("\n");
}

/** Builds the actual provider request (prompt + system + token budget) for a validated task input. The only place any of ORBIT's AI system prompts are written. */
export function buildTaskRequest<T extends TaskId>(taskId: T, input: TaskInput<T>): AiCompletionRequest {
  switch (taskId) {
    case "grammar": {
      const { text } = input as TaskInput<"grammar">;
      return {
        prompt: text,
        system:
          "You are a precise grammar and spelling checker. Return the corrected text, then on a new line starting with 'Changes:' briefly list what you fixed. If there are no issues, say so. Preserve the original meaning, tone, and formatting — do not rewrite beyond fixing actual errors.",
        maxTokens: 1024,
      };
    }
    case "rewrite": {
      const { text } = input as TaskInput<"rewrite">;
      return {
        prompt: text,
        system:
          "Rewrite the given text to be clearer and better written, while preserving its exact meaning and roughly its length. Respond only with the rewritten text.",
        maxTokens: 1024,
      };
    }
    case "paraphrase": {
      const { text } = input as TaskInput<"paraphrase">;
      return {
        prompt: text,
        system:
          "Paraphrase the given text using substantially different wording and sentence structure, while keeping the same meaning. Respond only with the paraphrased text.",
        maxTokens: 1024,
      };
    }
    case "summarize": {
      const { text, style } = input as TaskInput<"summarize">;
      return {
        prompt: text,
        system:
          style === "bullets"
            ? "Summarize the given text as 3-6 concise bullet points. Respond only with the bullets."
            : "Summarize the given text in a single, tight paragraph of 2-4 sentences.",
        maxTokens: 1024,
      };
    }
    case "tone": {
      const { text, tone } = input as TaskInput<"tone">;
      return {
        prompt: text,
        system: `Rewrite the given text in a ${tone.toLowerCase()} tone, keeping the same meaning and roughly the same length. Respond only with the rewritten text.`,
        maxTokens: 1024,
      };
    }
    case "email": {
      const { description, tone } = input as TaskInput<"email">;
      return {
        prompt: description,
        system: `Draft a complete, ready-to-send email in a ${tone.toLowerCase()} tone based on the user's description of what they need to say. Include a subject line. Respond only with the subject and email body. Do not invent facts (names, dates, figures) the user didn't provide.`,
        maxTokens: 1024,
      };
    }
    case "pdf-summary": {
      const { documentText } = input as TaskInput<"pdf-summary">;
      return {
        prompt: "Summarize this document in 3-5 concise bullet points, citing pages where useful.",
        system: groundedDocumentSystemPrompt(documentText),
        maxTokens: 1024,
      };
    }
    case "pdf-qa": {
      const { documentText, question } = input as TaskInput<"pdf-qa">;
      return {
        prompt: question,
        system: groundedDocumentSystemPrompt(documentText),
        maxTokens: 1024,
      };
    }
    case "assistant-chat": {
      const { conversation } = input as TaskInput<"assistant-chat">;
      const transcript = conversation
        .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
        .join("\n\n");
      return {
        prompt: transcript,
        system: assistantSystemPrompt(),
        maxTokens: 800,
      };
    }
  }
}
