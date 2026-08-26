"use client";

import { useMemo, useState } from "react";

import { getToolById } from "@/registry/tools";
import { csvToJson, jsonToCsv } from "@/lib/text/csv";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";

const tool = getToolById("csv-json")!;
const SAMPLE_CSV = "name,role\nAda Lovelace,Mathematician\nGrace Hopper,Computer Scientist";

export function CsvJsonTool() {
  const [direction, setDirection] = useState<"csv-to-json" | "json-to-csv">("csv-to-json");
  const [input, setInput] = useState("");

  const result = useMemo(() => {
    if (!input.trim()) return { ok: true as const, output: "" };
    try {
      if (direction === "csv-to-json") {
        return { ok: true as const, output: JSON.stringify(csvToJson(input), null, 2) };
      }
      const parsed = JSON.parse(input);
      return { ok: true as const, output: jsonToCsv(parsed) };
    } catch (error) {
      return { ok: false as const, message: error instanceof Error ? error.message : "Conversion failed." };
    }
  }, [input, direction]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 lg:px-8">
      <ToolHeader tool={tool} />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={direction === "csv-to-json" ? "primary" : "secondary"}
          onClick={() => setDirection("csv-to-json")}
        >
          CSV → JSON
        </Button>
        <Button
          variant={direction === "json-to-csv" ? "primary" : "secondary"}
          onClick={() => setDirection("json-to-csv")}
        >
          JSON → CSV
        </Button>
        <Button variant="ghost" onClick={() => setInput(direction === "csv-to-json" ? SAMPLE_CSV : JSON.stringify(csvToJson(SAMPLE_CSV)))}>
          Load sample
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
            {direction === "csv-to-json" ? "CSV" : "JSON"}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            rows={16}
            className="orbit-scrollbar w-full resize-y rounded-2xl border border-border bg-surface p-4 font-mono text-sm outline-none focus:border-accent/50"
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-xs font-medium uppercase tracking-wide text-muted">
              {direction === "csv-to-json" ? "JSON" : "CSV"}
            </label>
            <CopyButton value={result.ok ? result.output : ""} />
          </div>
          {!result.ok ? (
            <p className="rounded-2xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger">{result.message}</p>
          ) : (
            <textarea
              readOnly
              value={result.output}
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
