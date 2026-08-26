"use client";

import { useMemo, useState } from "react";

import { getToolById } from "@/registry/tools";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { Card } from "@/components/ui/Card";

const tool = getToolById("word-counter")!;

function computeStats(text: string) {
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;
  const sentences = trimmed ? (trimmed.match(/[.!?]+(?:\s|$)/g) ?? []).length || (trimmed ? 1 : 0) : 0;
  const paragraphs = trimmed ? trimmed.split(/\n{2,}/).filter((p) => p.trim()).length : 0;
  const readingMinutes = words / 200;
  const speakingMinutes = words / 130;

  return { words, characters, charactersNoSpaces, sentences, paragraphs, readingMinutes, speakingMinutes };
}

function formatMinutes(minutes: number): string {
  if (minutes < 1 / 60) return "0 sec";
  if (minutes < 1) return `${Math.max(1, Math.round(minutes * 60))} sec`;
  return `${Math.ceil(minutes)} min`;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-4">
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      <p className="mt-0.5 text-xs text-muted">{label}</p>
    </Card>
  );
}

export function WordCounter() {
  const [text, setText] = useState("");
  const stats = useMemo(() => computeStats(text), [text]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10 lg:px-8">
      <ToolHeader tool={tool} />

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Start typing or paste your text…"
        rows={10}
        className="orbit-scrollbar w-full resize-y rounded-2xl border border-border bg-surface p-4 text-sm outline-none placeholder:text-muted focus:border-accent/50"
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <Stat label="Words" value={stats.words} />
        <Stat label="Characters" value={stats.characters} />
        <Stat label="Characters (no spaces)" value={stats.charactersNoSpaces} />
        <Stat label="Sentences" value={stats.sentences} />
        <Stat label="Paragraphs" value={stats.paragraphs} />
        <Stat label="Reading time" value={formatMinutes(stats.readingMinutes)} />
        <Stat label="Speaking time" value={formatMinutes(stats.speakingMinutes)} />
      </div>
    </div>
  );
}
