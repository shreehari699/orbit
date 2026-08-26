"use client";

import { useState } from "react";
import * as Icons from "lucide-react";

import { getToolById } from "@/registry/tools";
import { createZip } from "@/lib/files/zip";
import { downloadBlob, formatBytes } from "@/lib/files/download";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { FileDropzone } from "@/components/tools/FileDropzone";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const tool = getToolById("zip-creator")!;

export function ZipCreator() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "working">("idle");

  function addFiles(newFiles: File[]) {
    setFiles((prev) => [...prev, ...newFiles]);
  }

  function remove(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleCreate() {
    setStatus("working");
    try {
      const zip = await createZip(files.map((f) => ({ name: f.name, blob: f })));
      downloadBlob(zip, "orbit-archive.zip");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10 lg:px-8">
      <ToolHeader tool={tool} />

      <FileDropzone
        accept="*"
        multiple
        label="Click to add files"
        hint="Zipped entirely in your browser — nothing is uploaded."
        onFiles={addFiles}
      />

      {files.length > 0 && (
        <Card className="flex flex-col divide-y divide-border p-0">
          {files.map((file, i) => (
            <div key={`${file.name}-${i}`} className="flex items-center gap-3 px-4 py-3">
              <Icons.File className="h-4 w-4 shrink-0 text-accent" strokeWidth={1.75} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{file.name}</p>
                <p className="text-xs text-muted">{formatBytes(file.size)}</p>
              </div>
              <button onClick={() => remove(i)} className="rounded p-1 text-muted hover:text-danger" aria-label="Remove">
                <Icons.X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
          ))}
        </Card>
      )}

      <Button variant="primary" onClick={handleCreate} disabled={files.length === 0 || status === "working"} className="w-fit">
        {status === "working" ? "Zipping…" : `Create archive (${files.length} file${files.length === 1 ? "" : "s"})`}
      </Button>
    </div>
  );
}
