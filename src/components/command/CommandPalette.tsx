"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as Icons from "lucide-react";

import { usePalette } from "./palette-context";
import { getQuickAnswer } from "@/registry/quick-answers";
import { searchTools } from "@/registry/search";
import { recordVisit } from "@/lib/workspace/history";

export function CommandPalette() {
  const { open, setOpen } = usePalette();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickAnswer = useMemo(() => getQuickAnswer(query), [query]);
  const results = useMemo(() => searchTools(query).slice(0, 8), [query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setHighlighted(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    setHighlighted(0);
  }, [query]);

  function go(href: string, toolId: string, label: string) {
    recordVisit({ toolId, label, href });
    setOpen(false);
    router.push(href);
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlighted((h) => Math.min(h + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (event.key === "Enter") {
      const result = results[highlighted];
      if (result) go(result.tool.href, result.tool.id, result.tool.label);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-[12vh] backdrop-blur-sm">
      <button
        aria-label="Close command palette"
        className="absolute inset-0"
        onClick={() => setOpen(false)}
      />
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface-raised shadow-2xl">
        <div className="flex items-center gap-2 border-b border-border px-4">
          <Icons.Search className="h-4 w-4 shrink-0 text-muted" strokeWidth={1.75} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search tools, or try “12 km to miles”, “40% of 250”…"
            className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-muted"
          />
          <kbd className="hidden shrink-0 rounded border border-border px-1.5 py-0.5 text-[10px] text-muted sm:block">
            Esc
          </kbd>
        </div>

        {quickAnswer && (
          <div className="border-b border-border bg-accent/5 px-4 py-3">
            <div className="text-[11px] uppercase tracking-wide text-muted">Quick answer</div>
            <div className="mt-0.5 flex items-baseline gap-2">
              <span className="text-lg font-semibold text-foreground">{quickAnswer.result}</span>
              {quickAnswer.detail && (
                <span className="text-xs text-muted">{quickAnswer.detail}</span>
              )}
            </div>
          </div>
        )}

        <div className="orbit-scrollbar max-h-72 overflow-y-auto p-2">
          {results.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted">No tools match “{query}”.</p>
          )}
          {results.map((result, index) => {
            const Icon = (Icons[result.tool.icon as keyof typeof Icons] ??
              Icons.Circle) as Icons.LucideIcon;
            return (
              <button
                key={result.tool.id}
                onMouseEnter={() => setHighlighted(index)}
                onClick={() => go(result.tool.href, result.tool.id, result.tool.label)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                  index === highlighted
                    ? "bg-accent/10 text-foreground"
                    : "text-muted hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                <span className="flex-1 truncate">
                  <span className="text-foreground">{result.tool.label}</span>
                  <span className="ml-2 text-xs text-muted">{result.tool.description}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
