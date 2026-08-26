import * as Icons from "lucide-react";

import type { AiCompletionStatus } from "@/lib/ai/useAiCompletion";
import type { AiErrorKind } from "@/lib/ai/types";
import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";

export function AiResultPanel({
  status,
  output,
  errorMessage,
  errorKind,
}: {
  status: AiCompletionStatus;
  output: string;
  errorMessage?: string;
  errorKind?: AiErrorKind | null;
}) {
  if (status === "idle") return null;

  if (status === "loading") {
    return (
      <Card className="flex items-center gap-2 p-5 text-sm text-muted">
        <Icons.Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
        Thinking…
      </Card>
    );
  }

  if (status === "not-configured") {
    return (
      <Card className="p-5 text-sm text-muted">
        No AI provider is configured. Set{" "}
        <code className="rounded bg-black/[0.05] px-1 dark:bg-white/[0.08]">GEMINI_API_KEY</code>,{" "}
        <code className="rounded bg-black/[0.05] px-1 dark:bg-white/[0.08]">ANTHROPIC_API_KEY</code>, or{" "}
        <code className="rounded bg-black/[0.05] px-1 dark:bg-white/[0.08]">OPENAI_API_KEY</code> to enable
        this tool — see <code className="rounded bg-black/[0.05] px-1 dark:bg-white/[0.08]">.env.example</code>.
      </Card>
    );
  }

  if (status === "error") {
    const isRateLimited = errorKind === "rate_limited";
    return (
      <Card
        className={`flex items-start gap-2 p-5 text-sm ${
          isRateLimited ? "border-accent/30 bg-accent/5 text-foreground" : "border-danger/30 bg-danger/5 text-danger"
        }`}
      >
        {isRateLimited ? (
          <Icons.Clock className="h-4 w-4 shrink-0 translate-y-0.5" strokeWidth={1.75} />
        ) : (
          <Icons.AlertTriangle className="h-4 w-4 shrink-0 translate-y-0.5" strokeWidth={1.75} />
        )}
        {errorMessage || "The AI provider request failed. Try again in a moment."}
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted">Result</span>
        <CopyButton value={output} />
      </div>
      <p className="whitespace-pre-wrap text-sm">{output}</p>
    </Card>
  );
}
