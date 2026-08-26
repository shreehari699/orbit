"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as Icons from "lucide-react";

import { getToolById, TOOLS } from "@/registry/tools";
import { getZeroDegreeApps } from "@/registry/apps";
import { useAiCompletion } from "@/lib/ai/useAiCompletion";
import { parseAssistantReply, type AssistantAction } from "./parseReply";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const tool = getToolById("ai-assistant")!;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  action?: AssistantAction | null;
}

const ALLOWED_HREFS = [
  ...TOOLS.map((t) => t.href),
  "/command",
  "/search",
  "/tools",
  "/favorites",
  "/history",
  "/apps",
  ...getZeroDegreeApps()
    .map((a) => a.url)
    .filter((url): url is string => Boolean(url)),
];

function ActionButton({ action }: { action: AssistantAction }) {
  const isExternal = action.href.startsWith("http");
  if (isExternal) {
    return (
      <a
        href={action.href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground transition hover:opacity-90"
      >
        {action.label}
        <Icons.ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
      </a>
    );
  }
  return (
    <Link
      href={action.href}
      className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground transition hover:opacity-90"
    >
      {action.label}
      <Icons.ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
    </Link>
  );
}

export function AiAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const ai = useAiCompletion();
  const pendingReplyRef = useRef(false);

  function handleSend() {
    const question = input.trim();
    if (!question) return;
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: question }];
    setMessages(nextMessages);
    setInput("");
    pendingReplyRef.current = true;

    void ai.run("assistant-chat", {
      conversation: nextMessages.map(({ role, content }) => ({ role, content })),
    });
  }

  // Appends the assistant's turn once a request this component started
  // actually resolves — a ref (not state) tracks "waiting on a reply" so
  // this never double-appends on unrelated re-renders.
  useEffect(() => {
    if (!pendingReplyRef.current) return;
    if (ai.status === "done" && ai.output) {
      pendingReplyRef.current = false;
      const parsed = parseAssistantReply(ai.output, ALLOWED_HREFS);
      setMessages((prev) => [...prev, { role: "assistant", content: parsed.reply, action: parsed.action }]);
    } else if (ai.status === "error" || ai.status === "not-configured") {
      pendingReplyRef.current = false;
    }
  }, [ai.status, ai.output]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 lg:px-8">
      <ToolHeader tool={tool} />

      <Card className="flex min-h-[26rem] flex-col gap-4 p-5">
        <div className="orbit-scrollbar flex-1 space-y-4 overflow-y-auto">
          {messages.length === 0 && (
            <p className="text-sm text-muted">
              Ask ORBIT what it can do — e.g. &quot;I need to shrink a PDF&quot; or &quot;how do I check my
              favorites&quot;.
            </p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "text-right" : ""}>
              <div
                className={`inline-block max-w-[85%] rounded-2xl px-4 py-2.5 text-left text-sm ${
                  m.role === "user" ? "bg-accent text-accent-foreground" : "bg-black/[0.04] dark:bg-white/[0.06]"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
                {m.action && (
                  <div className="mt-2">
                    <ActionButton action={m.action} />
                  </div>
                )}
              </div>
            </div>
          ))}
          {ai.status === "loading" && (
            <div className="flex items-center gap-2 text-sm text-muted">
              <Icons.Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
              Thinking…
            </div>
          )}
          {ai.status === "not-configured" && (
            <p className="text-sm text-muted">
              No AI provider is configured. Set <code className="rounded bg-black/[0.05] px-1 dark:bg-white/[0.08]">GEMINI_API_KEY</code>{" "}
              to enable the ORBIT AI Assistant — see <code className="rounded bg-black/[0.05] px-1 dark:bg-white/[0.08]">.env.example</code>.
            </p>
          )}
          {ai.status === "error" && <p className="text-sm text-danger">{ai.errorMessage}</p>}
        </div>

        <div className="flex gap-2 border-t border-border pt-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask ORBIT…"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent/50"
          />
          <Button variant="primary" onClick={handleSend} disabled={!input.trim() || ai.status === "loading"}>
            Send
          </Button>
        </div>
      </Card>
    </div>
  );
}
