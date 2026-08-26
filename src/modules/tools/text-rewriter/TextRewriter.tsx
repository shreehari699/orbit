"use client";

import { useState } from "react";

import { getToolById } from "@/registry/tools";
import { useAiCompletion } from "@/lib/ai/useAiCompletion";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { AiResultPanel } from "@/components/tools/AiResultPanel";
import { Button } from "@/components/ui/Button";

const tool = getToolById("text-rewriter")!;

export function TextRewriter() {
  const [text, setText] = useState("");
  const { status, output, run } = useAiCompletion();

  function handleRewrite() {
    void run(text, {
      system:
        "Rewrite the given text to be clearer and better written, while preserving its exact meaning and roughly its length. Respond only with the rewritten text.",
    });
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 lg:px-8">
      <ToolHeader tool={tool} />

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste text to rewrite…"
        rows={8}
        className="w-full resize-y rounded-2xl border border-border bg-surface p-4 text-sm outline-none placeholder:text-muted focus:border-accent/50"
      />

      <Button variant="primary" onClick={handleRewrite} disabled={!text.trim() || status === "loading"} className="w-fit">
        Rewrite
      </Button>

      <AiResultPanel status={status} output={output} />
    </div>
  );
}
