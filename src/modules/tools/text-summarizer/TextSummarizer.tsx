"use client";

import { useState } from "react";

import { getToolById } from "@/registry/tools";
import { useAiCompletion } from "@/lib/ai/useAiCompletion";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { AiResultPanel } from "@/components/tools/AiResultPanel";
import { Button } from "@/components/ui/Button";

const tool = getToolById("text-summarizer")!;

export function TextSummarizer() {
  const [text, setText] = useState("");
  const [style, setStyle] = useState<"bullets" | "paragraph">("bullets");
  const { status, output, errorMessage, errorKind, run } = useAiCompletion();

  function handleSummarize() {
    void run(text, {
      system:
        style === "bullets"
          ? "Summarize the given text as 3-6 concise bullet points. Respond only with the bullets."
          : "Summarize the given text in a single, tight paragraph of 2-4 sentences.",
    });
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 lg:px-8">
      <ToolHeader tool={tool} />

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste the text you want summarized…"
        rows={10}
        className="w-full resize-y rounded-2xl border border-border bg-surface p-4 text-sm outline-none placeholder:text-muted focus:border-accent/50"
      />

      <div className="flex items-center gap-2">
        <Button variant={style === "bullets" ? "primary" : "secondary"} onClick={() => setStyle("bullets")}>
          Bullet points
        </Button>
        <Button variant={style === "paragraph" ? "primary" : "secondary"} onClick={() => setStyle("paragraph")}>
          Paragraph
        </Button>
      </div>

      <Button variant="primary" onClick={handleSummarize} disabled={!text.trim() || status === "loading"} className="w-fit">
        Summarize
      </Button>

      <AiResultPanel status={status} output={output} errorMessage={errorMessage} errorKind={errorKind} />
    </div>
  );
}
