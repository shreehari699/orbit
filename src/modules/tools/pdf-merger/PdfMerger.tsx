"use client";

import { useState } from "react";
import * as Icons from "lucide-react";

import { getToolById } from "@/registry/tools";
import { mergePdfs } from "@/lib/pdf/manipulate";
import { downloadBlob, formatBytes } from "@/lib/files/download";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { FileDropzone } from "@/components/tools/FileDropzone";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const tool = getToolById("pdf-merger")!;

export function PdfMerger() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "working" | "error">("idle");
  const [error, setError] = useState("");

  function addFiles(newFiles: File[]) {
    setFiles((prev) => [...prev, ...newFiles.filter((f) => f.type === "application/pdf")]);
  }

  function move(index: number, direction: -1 | 1) {
    setFiles((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });
  }

  function remove(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleMerge() {
    setStatus("working");
    setError("");
    try {
      const bytes = await mergePdfs(files);
      downloadBlob(new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" }), "merged.pdf");
      setStatus("idle");
    } catch {
      setError("Could not merge these PDFs — make sure every file is a valid PDF.");
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 lg:px-8">
      <ToolHeader tool={tool} />

      <FileDropzone
        accept="application/pdf"
        multiple
        label="Click to add PDFs"
        hint="Merged entirely in your browser — nothing is uploaded."
        onFiles={addFiles}
      />

      {files.length > 0 && (
        <Card className="flex flex-col divide-y divide-border p-0">
          {files.map((file, i) => (
            <div key={`${file.name}-${i}`} className="flex items-center gap-3 px-4 py-3">
              <Icons.FileText className="h-4 w-4 shrink-0 text-accent" strokeWidth={1.75} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{file.name}</p>
                <p className="text-xs text-muted">{formatBytes(file.size)}</p>
              </div>
              <button
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="rounded p-1 text-muted hover:text-foreground disabled:opacity-30"
                aria-label="Move up"
              >
                <Icons.ChevronUp className="h-4 w-4" strokeWidth={1.75} />
              </button>
              <button
                onClick={() => move(i, 1)}
                disabled={i === files.length - 1}
                className="rounded p-1 text-muted hover:text-foreground disabled:opacity-30"
                aria-label="Move down"
              >
                <Icons.ChevronDown className="h-4 w-4" strokeWidth={1.75} />
              </button>
              <button
                onClick={() => remove(i)}
                className="rounded p-1 text-muted hover:text-danger"
                aria-label="Remove"
              >
                <Icons.X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
          ))}
        </Card>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button
        variant="primary"
        onClick={handleMerge}
        disabled={files.length < 2 || status === "working"}
        className="w-fit"
      >
        {status === "working" ? "Merging…" : `Merge ${files.length || ""} PDFs`}
      </Button>
    </div>
  );
}
