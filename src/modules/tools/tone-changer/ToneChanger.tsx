"use client";

import { useState } from "react";

import { getToolById } from "@/registry/tools";
import { useAiCompletion } from "@/lib/ai/useAiCompletion";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { AiResultPanel } from "@/components/tools/AiResultPanel";
import { Button } from "@/components/ui/Button";

const tool = getToolById("tone-changer")!;
const TONES = ["Formal", "Friendly", "Confident", "Casual", "Empathetic", "Persuasive"] as const;

export function ToneChanger() {
  const [text, setText] = useState("");
  const [tone, setTone] = useState<(typeof TONES)[number]>("Formal");
  const { status, output, errorMessage, errorKind, run } = useAiCompletion();

  function handleRun() {
    void run(text, {
      system: `Rewrite the given text in a ${tone.toLowerCase()} tone, keeping the same meaning and roughly the same length. Respond only with the rewritten text.`,
    });
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 lg:px-8">
      <ToolHeader tool={tool} />

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste text to change the tone of…"
        rows={8}
        className="w-full resize-y rounded-2xl border border-border bg-surface p-4 text-sm outline-none placeholder:text-muted focus:border-accent/50"
      />

      <div className="flex flex-wrap gap-2">
        {TONES.map((t) => (
          <Button key={t} variant={tone === t ? "primary" : "secondary"} onClick={() => setTone(t)}>
            {t}
          </Button>
        ))}
      </div>

      <Button variant="primary" onClick={handleRun} disabled={!text.trim() || status === "loading"} className="w-fit">
        Change tone
      </Button>

      <AiResultPanel status={status} output={output} errorMessage={errorMessage} errorKind={errorKind} />
    </div>
  );
}
