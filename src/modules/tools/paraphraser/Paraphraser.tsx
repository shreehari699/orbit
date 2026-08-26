"use client";

import { useState } from "react";

import { getToolById } from "@/registry/tools";
import { useAiCompletion } from "@/lib/ai/useAiCompletion";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { AiResultPanel } from "@/components/tools/AiResultPanel";
import { Button } from "@/components/ui/Button";

const tool = getToolById("paraphraser")!;

export function Paraphraser() {
  const [text, setText] = useState("");
  const { status, output, errorMessage, errorKind, run } = useAiCompletion();

  function handleParaphrase() {
    void run(text, {
      system:
        "Paraphrase the given text using substantially different wording and sentence structure, while keeping the same meaning. Respond only with the paraphrased text.",
    });
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 lg:px-8">
      <ToolHeader tool={tool} />

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste a sentence or paragraph to paraphrase…"
        rows={6}
        className="w-full resize-y rounded-2xl border border-border bg-surface p-4 text-sm outline-none placeholder:text-muted focus:border-accent/50"
      />

      <Button variant="primary" onClick={handleParaphrase} disabled={!text.trim() || status === "loading"} className="w-fit">
        Paraphrase
      </Button>

      <AiResultPanel status={status} output={output} errorMessage={errorMessage} errorKind={errorKind} />
    </div>
  );
}
