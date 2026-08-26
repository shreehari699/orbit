"use client";

import { useRef, useState } from "react";
import * as Icons from "lucide-react";

import { getToolById } from "@/registry/tools";
import { extractPdf, type PdfExtractionResult } from "@/lib/pdf/extract";
import { requestAiCompletion } from "@/lib/ai/client";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { Badge } from "@/components/ui/Badge";

const tool = getToolById("pdf-intelligence")!;

type Status = "idle" | "loading" | "ready" | "error";
type SummaryStatus = "idle" | "loading" | "ready" | "not-configured" | "error";

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-4">
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      <p className="mt-0.5 text-xs text-muted">{label}</p>
    </Card>
  );
}

export function PdfIntelligence() {
  const [status, setStatus] = useState<Status>("idle");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<PdfExtractionResult | null>(null);
  const [summaryStatus, setSummaryStatus] = useState<SummaryStatus>("idle");
  const [summary, setSummary] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setFileName(file.name);
    setStatus("loading");
    setError("");
    setResult(null);
    setSummary("");
    setSummaryStatus("idle");
    try {
      const extracted = await extractPdf(file);
      setResult(extracted);
      setStatus("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read this PDF.");
      setStatus("error");
    }
  }

  async function handleSummarize() {
    if (!result?.text) return;
    setSummaryStatus("loading");
    try {
      const response = await requestAiCompletion(
        `Summarize the following document in 3-5 concise bullet points:\n\n${result.text.slice(0, 12000)}`,
        { system: "You are a precise document summarizer. Respond only with the bullet points." },
      );
      if (!response.configured) {
        setSummaryStatus("not-configured");
        return;
      }
      if (response.error) {
        setSummaryStatus("error");
        return;
      }
      setSummary(response.text ?? "");
      setSummaryStatus("ready");
    } catch {
      setSummaryStatus("error");
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10 lg:px-8">
      <ToolHeader tool={tool} />

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />

      <button
        onClick={() => inputRef.current?.click()}
        className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-surface px-6 py-12 text-center transition hover:border-accent/40"
      >
        <Icons.FileUp className="h-7 w-7 text-accent" strokeWidth={1.5} />
        <p className="text-sm font-medium">
          {fileName ? fileName : "Click to choose a PDF"}
        </p>
        <p className="text-xs text-muted">Extraction happens locally in your browser — nothing is uploaded.</p>
      </button>

      {status === "loading" && (
        <p className="text-sm text-muted">Extracting text from {fileName}…</p>
      )}

      {status === "error" && (
        <div className="flex items-start gap-2 rounded-2xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
          <Icons.AlertTriangle className="h-4 w-4 shrink-0 translate-y-0.5" strokeWidth={1.75} />
          <p>{error}</p>
        </div>
      )}

      {status === "ready" && result && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Pages" value={result.pageCount} />
            <Stat label="Words" value={result.words} />
            <Stat label="Characters" value={result.characters} />
            <Stat
              label="Reading time"
              value={result.readingMinutes < 1 ? "< 1 min" : `${Math.ceil(result.readingMinutes)} min`}
            />
          </div>

          <Card className="flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icons.Sparkles className="h-4 w-4 text-accent" strokeWidth={1.75} />
                <span className="text-sm font-medium">AI summary</span>
                {summaryStatus === "not-configured" && <Badge tone="neutral">Not configured</Badge>}
              </div>
              <Button
                variant="secondary"
                onClick={handleSummarize}
                disabled={summaryStatus === "loading" || !result.text}
              >
                {summaryStatus === "loading" ? "Summarizing…" : "Generate summary"}
              </Button>
            </div>

            {summaryStatus === "not-configured" && (
              <p className="text-sm text-muted">
                No AI provider is configured. Set <code className="rounded bg-black/[0.05] px-1 dark:bg-white/[0.08]">ANTHROPIC_API_KEY</code>{" "}
                or <code className="rounded bg-black/[0.05] px-1 dark:bg-white/[0.08]">OPENAI_API_KEY</code> to enable this — see{" "}
                <code className="rounded bg-black/[0.05] px-1 dark:bg-white/[0.08]">.env.example</code>.
              </p>
            )}
            {summaryStatus === "error" && (
              <p className="text-sm text-danger">The AI provider request failed. Try again in a moment.</p>
            )}
            {summaryStatus === "ready" && (
              <p className="whitespace-pre-wrap text-sm">{summary}</p>
            )}
            {!result.text && (
              <p className="text-sm text-muted">No extractable text found — this PDF may be scanned images only.</p>
            )}
          </Card>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-muted">Extracted text</span>
              <CopyButton value={result.text} />
            </div>
            <textarea
              readOnly
              value={result.text || "(no extractable text)"}
              rows={12}
              className="orbit-scrollbar w-full resize-y rounded-2xl border border-border bg-surface p-4 font-mono text-sm outline-none"
            />
          </div>
        </>
      )}
    </div>
  );
}
