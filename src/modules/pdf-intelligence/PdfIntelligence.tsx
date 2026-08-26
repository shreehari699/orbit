"use client";

import { useRef, useState } from "react";
import * as Icons from "lucide-react";

import { getToolById } from "@/registry/tools";
import { extractPdf, type PdfExtractionResult } from "@/lib/pdf/extract";
import { useAiCompletion } from "@/lib/ai/useAiCompletion";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { AiResultPanel } from "@/components/tools/AiResultPanel";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { StatCard } from "@/components/ui/StatCard";

const tool = getToolById("pdf-intelligence")!;

type Status = "idle" | "loading" | "ready" | "error";

export function PdfIntelligence() {
  const [status, setStatus] = useState<Status>("idle");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<PdfExtractionResult | null>(null);
  const [question, setQuestion] = useState("");
  const summaryAi = useAiCompletion();
  const qaAi = useAiCompletion();
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setFileName(file.name);
    setStatus("loading");
    setError("");
    setResult(null);
    setQuestion("");
    try {
      const extracted = await extractPdf(file);
      setResult(extracted);
      setStatus("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read this PDF.");
      setStatus("error");
    }
  }

  function handleSummarize() {
    if (!result?.text) return;
    void summaryAi.run("pdf-summary", { documentText: result.text });
  }

  function handleAsk() {
    if (!result?.text || !question.trim()) return;
    void qaAi.run("pdf-qa", { documentText: result.text, question });
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
            <StatCard label="Pages" value={result.pageCount} />
            <StatCard label="Words" value={result.words} />
            <StatCard label="Characters" value={result.characters} />
            <StatCard
              label="Reading time"
              value={result.readingMinutes < 1 ? "< 1 min" : `${Math.ceil(result.readingMinutes)} min`}
            />
          </div>

          {!result.text ? (
            <Card className="p-4 text-sm text-muted">
              No extractable text found — this PDF may be scanned images only. Try{" "}
              <a href="/tools/image-to-text" className="text-accent hover:underline">
                Image → Text (OCR)
              </a>{" "}
              on a page screenshot instead.
            </Card>
          ) : (
            <>
              <Card className="flex flex-col gap-3 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icons.Sparkles className="h-4 w-4 text-accent" strokeWidth={1.75} />
                    <span className="text-sm font-medium">AI summary</span>
                  </div>
                  <Button variant="secondary" onClick={handleSummarize} disabled={summaryAi.status === "loading"}>
                    {summaryAi.status === "loading" ? "Summarizing…" : "Generate summary"}
                  </Button>
                </div>
                <AiResultPanel
                  status={summaryAi.status}
                  output={summaryAi.output}
                  errorMessage={summaryAi.errorMessage}
                  errorKind={summaryAi.errorKind}
                />
              </Card>

              <Card className="flex flex-col gap-3 p-4">
                <div className="flex items-center gap-2">
                  <Icons.MessageCircleQuestion className="h-4 w-4 text-accent" strokeWidth={1.75} />
                  <span className="text-sm font-medium">Ask the document</span>
                </div>
                <p className="text-xs text-muted">
                  Answers are grounded only in this document&apos;s text — if it&apos;s not in there, ORBIT says so
                  instead of guessing.
                </p>
                <div className="flex gap-2">
                  <input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAsk()}
                    placeholder="e.g. What does this document say about pricing?"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent/50"
                  />
                  <Button
                    variant="primary"
                    onClick={handleAsk}
                    disabled={!question.trim() || qaAi.status === "loading"}
                  >
                    Ask
                  </Button>
                </div>
                <AiResultPanel
                  status={qaAi.status}
                  output={qaAi.output}
                  errorMessage={qaAi.errorMessage}
                  errorKind={qaAi.errorKind}
                />
              </Card>
            </>
          )}

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
