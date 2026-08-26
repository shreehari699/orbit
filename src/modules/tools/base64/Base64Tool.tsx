"use client";

import { useMemo, useState } from "react";

import { getToolById } from "@/registry/tools";
import { decodeBase64, encodeBase64 } from "@/lib/text/base64";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";

const tool = getToolById("base64")!;

export function Base64Tool() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("");

  const result = useMemo(() => {
    if (!input) return { ok: true as const, value: "" };
    try {
      return { ok: true as const, value: mode === "encode" ? encodeBase64(input) : decodeBase64(input) };
    } catch {
      return { ok: false as const, value: "" };
    }
  }, [input, mode]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10 lg:px-8">
      <ToolHeader tool={tool} />

      <div className="flex gap-2">
        <Button variant={mode === "encode" ? "primary" : "secondary"} onClick={() => setMode("encode")}>
          Encode
        </Button>
        <Button variant={mode === "decode" ? "primary" : "secondary"} onClick={() => setMode("decode")}>
          Decode
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
            {mode === "encode" ? "Text" : "Base64"}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            rows={12}
            className="orbit-scrollbar w-full resize-y rounded-2xl border border-border bg-surface p-4 font-mono text-sm outline-none focus:border-accent/50"
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-xs font-medium uppercase tracking-wide text-muted">
              {mode === "encode" ? "Base64" : "Text"}
            </label>
            <CopyButton value={result.value} />
          </div>
          {!result.ok ? (
            <p className="rounded-2xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
              Invalid Base64 input.
            </p>
          ) : (
            <textarea
              readOnly
              value={result.value}
              spellCheck={false}
              rows={12}
              className="orbit-scrollbar w-full resize-y rounded-2xl border border-border bg-surface p-4 font-mono text-sm outline-none"
            />
          )}
        </div>
      </div>
    </div>
  );
}
