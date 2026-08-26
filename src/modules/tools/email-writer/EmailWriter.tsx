"use client";

import { useState } from "react";

import { getToolById } from "@/registry/tools";
import { useAiCompletion } from "@/lib/ai/useAiCompletion";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { AiResultPanel } from "@/components/tools/AiResultPanel";
import { Button } from "@/components/ui/Button";

const tool = getToolById("email-writer")!;
const TONES = ["Professional", "Friendly", "Direct", "Apologetic"] as const;

export function EmailWriter() {
  const [description, setDescription] = useState("");
  const [tone, setTone] = useState<(typeof TONES)[number]>("Professional");
  const { status, output, errorMessage, errorKind, run } = useAiCompletion();

  function handleRun() {
    void run(description, {
      system: `Draft a complete, ready-to-send email in a ${tone.toLowerCase()} tone based on the user's description of what they need to say. Include a subject line. Respond only with the subject and email body.`,
    });
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 lg:px-8">
      <ToolHeader tool={tool} />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe what the email needs to say — e.g. 'ask my manager for Friday off for a family event'…"
        rows={5}
        className="w-full resize-y rounded-2xl border border-border bg-surface p-4 text-sm outline-none placeholder:text-muted focus:border-accent/50"
      />

      <div className="flex flex-wrap gap-2">
        {TONES.map((t) => (
          <Button key={t} variant={tone === t ? "primary" : "secondary"} onClick={() => setTone(t)}>
            {t}
          </Button>
        ))}
      </div>

      <Button variant="primary" onClick={handleRun} disabled={!description.trim() || status === "loading"} className="w-fit">
        Write email
      </Button>

      <AiResultPanel status={status} output={output} errorMessage={errorMessage} errorKind={errorKind} />
    </div>
  );
}
