"use client";

import { useState } from "react";

import { getToolById } from "@/registry/tools";
import { recognizeText } from "@/lib/ocr/recognize";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { FileDropzone } from "@/components/tools/FileDropzone";
import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";
import { Button } from "@/components/ui/Button";

const tool = getToolById("image-to-text")!;

export function ImageToText() {
  const [src, setSrc] = useState("");
  const [status, setStatus] = useState<"idle" | "working" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  async function handleFiles(files: File[]) {
    const picked = files[0];
    if (!picked) return;
    setSrc(URL.createObjectURL(picked));
    setStatus("working");
    setProgress(0);
    setError("");
    try {
      const result = await recognizeText(picked, setProgress);
      setText(result.trim());
      setStatus("done");
    } catch {
      setError(
        "OCR failed to load. This tool downloads a language model on first use — check your connection and try again.",
      );
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 lg:px-8">
      <ToolHeader tool={tool} />

      {!src && (
        <FileDropzone
          accept="image/*"
          label="Click to choose a photo or screenshot"
          hint="Runs locally in your browser via an OCR engine downloaded on first use."
          onFiles={handleFiles}
        />
      )}

      {src && (
        <Card className="flex flex-col items-center gap-4 p-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="Source" className="max-h-64 rounded-lg object-contain" />
          <Button variant="ghost" onClick={() => setSrc("")}>
            Choose another
          </Button>
        </Card>
      )}

      {status === "working" && (
        <div>
          <div className="mb-1 flex justify-between text-xs text-muted">
            <span>Recognizing text…</span>
            <span>{Math.round(progress * 100)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
            <div
              className="h-full rounded-full bg-accent transition-[width]"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        </div>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

      {status === "done" && (
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs font-medium uppercase tracking-wide text-muted">Extracted text</label>
            <CopyButton value={text} />
          </div>
          <textarea
            readOnly
            value={text || "(no text detected)"}
            rows={10}
            className="orbit-scrollbar w-full resize-y rounded-2xl border border-border bg-surface p-4 text-sm outline-none"
          />
        </div>
      )}
    </div>
  );
}
