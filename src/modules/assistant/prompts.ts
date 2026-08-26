import { TOOLS } from "@/registry/tools";
import { getZeroDegreeApps } from "@/registry/apps";

/**
 * The ORBIT AI Assistant's system prompt: grounds it in what ORBIT
 * actually contains (so it recommends real tools/routes, never invented
 * ones) and constrains its output to strict JSON so the UI can render a
 * real, clickable navigation suggestion instead of just prose — and so
 * it can never claim to have performed an action itself.
 */
export function buildAssistantSystemPrompt(): string {
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
    "Set \"action\" to null when there's no single relevant tool/app to point to.",
  ].join("\n");
}

export function buildConversationPrompt(history: { role: "user" | "assistant"; content: string }[]): string {
  return history.map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n\n");
}
