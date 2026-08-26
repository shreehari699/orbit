"use client";

import { useState } from "react";

import { getToolById } from "@/registry/tools";
import { renderPdfPages } from "@/lib/pdf/render";
import { pdfFromJpegPages } from "@/lib/pdf/manipulate";
import { downloadBlob, formatBytes } from "@/lib/files/download";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { FileDropzone } from "@/components/tools/FileDropzone";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const tool = getToolById("pdf-compressor")!;

type Status = "idle" | "working" | "done" | "error";

export function PdfCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(0.6);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  async function handleFiles(files: File[]) {
    const picked = files[0];
    if (!picked) return;
    setFile(picked);
    setResultBlob(null);
    setError("");
  }

  async function handleCompress() {
    if (!file) return;
    setStatus("working");
    setError("");
    setResultBlob(null);
    try {
      // Scale 1.5 keeps text legible after rasterizing without ballooning
      // pixel count — the quality slider does most of the size work.
      const pages = await renderPdfPages(
        file,
        { scale: 1.5, mimeType: "image/jpeg", quality },
        (done, total) => setProgress({ done, total }),
      );
      const bytes = await pdfFromJpegPages(pages);
      setResultBlob(new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" }));
      setStatus("done");
    } catch {
      setError("Could not compress this PDF.");
      setStatus("error");
    }
  }

  const savingsPercent =
    file && resultBlob ? Math.round((1 - resultBlob.size / file.size) * 100) : null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10 lg:px-8">
      <ToolHeader tool={tool} />

      {!file && (
        <FileDropzone
          accept="application/pdf"
          label="Click to choose a PDF"
          hint="Compressed entirely in your browser — nothing is uploaded."
          onFiles={handleFiles}
        />
      )}

      {file && (
        <Card className="flex flex-col gap-4 p-5">
          <p className="text-sm">
            <strong>{file.name}</strong> — {formatBytes(file.size)}
          </p>

          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span>Quality (lower = smaller file)</span>
              <span className="tabular-nums text-muted">{Math.round(quality * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.2}
              max={0.9}
              step={0.05}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full accent-accent"
            />
          </div>

          <p className="text-xs text-muted">
            Every page is re-encoded as a compressed image. Great for scanned or image-heavy PDFs;
            the result won&apos;t have selectable text.
          </p>

          {status === "working" && (
            <p className="text-sm text-muted">
              Compressing page {progress.done} of {progress.total || "…"}…
            </p>
          )}
          {error && <p className="text-sm text-danger">{error}</p>}

          {resultBlob && (
            <p className="text-sm">
              New size: <strong>{formatBytes(resultBlob.size)}</strong>
              {savingsPercent !== null && savingsPercent > 0 && (
                <span className="text-success"> (-{savingsPercent}%)</span>
              )}
            </p>
          )}

          <div className="flex items-center gap-2">
            <Button variant="primary" onClick={handleCompress} disabled={status === "working"}>
              {status === "working" ? "Compressing…" : "Compress"}
            </Button>
            {resultBlob && (
              <Button variant="secondary" onClick={() => downloadBlob(resultBlob, "compressed.pdf")}>
                Download
              </Button>
            )}
            <Button variant="ghost" onClick={() => setFile(null)} className="ml-auto">
              Choose another
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
