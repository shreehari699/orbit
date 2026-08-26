export interface AssistantAction {
  type: "navigate";
  href: string;
  label: string;
}

export interface AssistantReply {
  reply: string;
  action: AssistantAction | null;
}

/**
 * Parses the model's JSON-only reply defensively: a model can still
 * wrap JSON in a code fence, add stray whitespace, or (rarely) ignore
 * the instruction entirely. Never throws — a parse failure degrades to
 * "the raw text, no action" rather than crashing the chat. A suggested
 * action is only honored if its href is one ORBIT actually has —
 * otherwise the assistant could point at a route that doesn't exist.
 */
export function parseAssistantReply(raw: string, allowedHrefs: string[]): AssistantReply {
  const allowed = new Set(allowedHrefs);
  const stripped = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");

  try {
    const parsed = JSON.parse(stripped) as Partial<AssistantReply>;
    if (typeof parsed.reply !== "string" || !parsed.reply.trim()) {
      return { reply: raw.trim(), action: null };
    }
    const action = parsed.action;
    if (
      action &&
      typeof action === "object" &&
      action.type === "navigate" &&
      typeof action.href === "string" &&
      typeof action.label === "string" &&
      allowed.has(action.href)
    ) {
      return { reply: parsed.reply, action: { type: "navigate", href: action.href, label: action.label } };
    }
    return { reply: parsed.reply, action: null };
  } catch {
    return { reply: raw.trim(), action: null };
  }
}
