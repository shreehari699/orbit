"use client";

import { useState } from "react";
import * as Icons from "lucide-react";

import { getToolById } from "@/registry/tools";
import { imagesToPdf } from "@/lib/pdf/manipulate";
import { downloadBlob } from "@/lib/files/download";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { FileDropzone } from "@/components/tools/FileDropzone";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const tool = getToolById("images-to-pdf")!;
const SUPPORTED = new Set(["image/jpeg", "image/png"]);

export function ImagesToPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "working">("idle");
  const [error, setError] = useState("");

  function addFiles(newFiles: File[]) {
    const supported = newFiles.filter((f) => SUPPORTED.has(f.type));
    if (supported.length < newFiles.length) {
      setError("Only JPEG and PNG images are supported — unsupported files were skipped.");
    } else {
      setError("");
    }
    setFiles((prev) => [...prev, ...supported]);
  }

  function remove(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleConvert() {
    setStatus("working");
    try {
      const bytes = await imagesToPdf(files);
      downloadBlob(new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" }), "images.pdf");
    } catch {
      setError("Could not build a PDF from these images.");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10 lg:px-8">
      <ToolHeader tool={tool} />

      <FileDropzone
        accept="image/jpeg,image/png"
        multiple
        label="Click to add images"
        hint="JPEG and PNG — processed entirely in your browser."
        onFiles={addFiles}
      />

      {error && <p className="text-sm text-danger">{error}</p>}

      {files.length > 0 && (
        <Card className="flex flex-col divide-y divide-border p-0">
          {files.map((file, i) => (
            <div key={`${file.name}-${i}`} className="flex items-center gap-3 px-4 py-3">
              <Icons.FileImage className="h-4 w-4 shrink-0 text-accent" strokeWidth={1.75} />
              <p className="min-w-0 flex-1 truncate text-sm">{file.name}</p>
              <button onClick={() => remove(i)} className="rounded p-1 text-muted hover:text-danger" aria-label="Remove">
                <Icons.X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
          ))}
        </Card>
      )}

      <Button variant="primary" onClick={handleConvert} disabled={files.length === 0 || status === "working"} className="w-fit">
        {status === "working" ? "Building PDF…" : "Create PDF"}
      </Button>
    </div>
  );
}
