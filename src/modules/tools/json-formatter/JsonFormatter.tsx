"use client";

import { useMemo, useState } from "react";
import * as Icons from "lucide-react";

import { getToolById } from "@/registry/tools";
import { formatJson, minifyJson } from "@/lib/text/json";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { Badge } from "@/components/ui/Badge";

const tool = getToolById("json-formatter")!;
const SAMPLE = '{\n  "orbit": true,\n  "tools": ["search", "convert", "format"]\n}';

export function JsonFormatter() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"format" | "minify">("format");

  const result = useMemo(() => {
    if (!input.trim()) return { ok: true as const, output: "" };
    return mode === "format" ? formatJson(input) : minifyJson(input);
  }, [input, mode]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 lg:px-8">
      <ToolHeader tool={tool} />

      <div className="flex flex-wrap items-center gap-2">
        <Button variant={mode === "format" ? "primary" : "secondary"} onClick={() => setMode("format")}>
          Format
        </Button>
        <Button variant={mode === "minify" ? "primary" : "secondary"} onClick={() => setMode("minify")}>
          Minify
        </Button>
        <Button variant="ghost" onClick={() => setInput(SAMPLE)}>
          Load sample
        </Button>
        {input.trim() && (
          <Badge tone={result.ok ? "success" : "danger"} className="ml-auto">
            {result.ok ? "Valid JSON" : "Invalid JSON"}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
            Input
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste JSON here…"
            spellCheck={false}
            rows={16}
            className="orbit-scrollbar w-full resize-y rounded-2xl border border-border bg-surface p-4 font-mono text-sm outline-none placeholder:text-muted focus:border-accent/50"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-xs font-medium uppercase tracking-wide text-muted">
              Output
            </label>
            <CopyButton value={result.ok ? (result.output ?? "") : ""} />
          </div>
          {!result.ok ? (
            <div className="flex items-start gap-2 rounded-2xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
              <Icons.AlertTriangle className="h-4 w-4 shrink-0 translate-y-0.5" strokeWidth={1.75} />
              <div>
                <p className="font-medium">{result.message}</p>
                {result.line && (
                  <p className="mt-0.5 text-xs opacity-80">
                    Line {result.line}, column {result.column}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <textarea
              readOnly
              value={result.output ?? ""}
              spellCheck={false}
              rows={16}
              className="orbit-scrollbar w-full resize-y rounded-2xl border border-border bg-surface p-4 font-mono text-sm outline-none"
            />
          )}
        </div>
      </div>
    </div>
  );
}
