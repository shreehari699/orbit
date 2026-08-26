"use client";

import { useState } from "react";

import { getToolById } from "@/registry/tools";
import { useAiCompletion } from "@/lib/ai/useAiCompletion";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { AiResultPanel } from "@/components/tools/AiResultPanel";
import { Button } from "@/components/ui/Button";

const tool = getToolById("grammar-checker")!;

export function GrammarChecker() {
  const [text, setText] = useState("");
  const { status, output, errorMessage, errorKind, run } = useAiCompletion();

  function handleCheck() {
    void run("grammar", { text });
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 lg:px-8">
      <ToolHeader tool={tool} />

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste text to check for grammar and spelling…"
        rows={8}
        className="w-full resize-y rounded-2xl border border-border bg-surface p-4 text-sm outline-none placeholder:text-muted focus:border-accent/50"
      />

      <Button variant="primary" onClick={handleCheck} disabled={!text.trim() || status === "loading"} className="w-fit">
        Check grammar
      </Button>

      <AiResultPanel status={status} output={output} errorMessage={errorMessage} errorKind={errorKind} />
    </div>
  );
}
