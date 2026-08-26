"use client";

import { useMemo, useState } from "react";

import { getToolById } from "@/registry/tools";
import { CASE_CONVERTERS } from "@/lib/text/case";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";

const tool = getToolById("text-case")!;

export function TextCaseConverter() {
  const [text, setText] = useState("");

  const outputs = useMemo(
    () => CASE_CONVERTERS.map((c) => ({ ...c, value: c.convert(text) })),
    [text],
  );

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10 lg:px-8">
      <ToolHeader tool={tool} />

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type or paste text to convert…"
        rows={4}
        className="w-full resize-y rounded-2xl border border-border bg-surface p-4 text-sm outline-none placeholder:text-muted focus:border-accent/50"
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {outputs.map((o) => (
          <Card key={o.id} className="flex flex-col gap-2 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-muted">{o.label}</span>
              <CopyButton value={o.value} />
            </div>
            <p className="min-h-[1.5rem] break-words font-mono text-sm">{o.value || "—"}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
