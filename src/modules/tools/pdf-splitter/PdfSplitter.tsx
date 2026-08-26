"use client";

import { useState } from "react";

import { getToolById } from "@/registry/tools";
import { extractPages, getPdfPageCount, parsePageRange } from "@/lib/pdf/manipulate";
import { downloadBlob } from "@/lib/files/download";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { FileDropzone } from "@/components/tools/FileDropzone";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const tool = getToolById("pdf-splitter")!;

export function PdfSplitter() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [range, setRange] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "working">("idle");

  async function handleFiles(files: File[]) {
    const picked = files[0];
    if (!picked) return;
    setError("");
    try {
      const count = await getPdfPageCount(picked);
      setFile(picked);
      setPageCount(count);
      setRange(`1-${count}`);
    } catch {
      setError("Could not read this PDF.");
    }
  }

  async function handleSplit() {
    if (!file) return;
    setStatus("working");
    setError("");
    try {
      const indices = parsePageRange(range, pageCount);
      if (indices.length === 0) throw new Error("Enter at least one page.");
      const bytes = await extractPages(file, indices);
      downloadBlob(new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" }), "split.pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not split this PDF.");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10 lg:px-8">
      <ToolHeader tool={tool} />

      {!file && (
        <FileDropzone
          accept="application/pdf"
          label="Click to choose a PDF"
          hint="Split entirely in your browser — nothing is uploaded."
          onFiles={handleFiles}
        />
      )}

      {file && (
        <Card className="flex flex-col gap-4 p-5">
          <p className="text-sm">
            <strong>{file.name}</strong> — {pageCount} page{pageCount === 1 ? "" : "s"}
          </p>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">
              Pages to extract
            </span>
            <input
              value={range}
              onChange={(e) => setRange(e.target.value)}
              placeholder="e.g. 1,3,5-7"
              className="rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus:border-accent/50"
            />
          </label>
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex items-center gap-2">
            <Button variant="primary" onClick={handleSplit} disabled={status === "working"}>
              {status === "working" ? "Extracting…" : "Extract pages"}
            </Button>
            <Button variant="ghost" onClick={() => setFile(null)}>
              Choose another
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
