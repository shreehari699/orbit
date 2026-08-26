"use client";

import { useState } from "react";
import * as Icons from "lucide-react";

import { getToolById } from "@/registry/tools";
import { extractZip, type ExtractedFile } from "@/lib/files/zip";
import { downloadBlob, formatBytes } from "@/lib/files/download";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { FileDropzone } from "@/components/tools/FileDropzone";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const tool = getToolById("zip-extractor")!;

export function ZipExtractor() {
  const [entries, setEntries] = useState<ExtractedFile[]>([]);
  const [error, setError] = useState("");

  async function handleFiles(files: File[]) {
    const picked = files[0];
    if (!picked) return;
    setError("");
    try {
      setEntries(await extractZip(picked));
    } catch {
      setError("Could not read this archive — it may be corrupt or password-protected.");
    }
  }

  function downloadEntry(entry: ExtractedFile) {
    downloadBlob(new Blob([entry.bytes.buffer as ArrayBuffer]), entry.name.split("/").pop() ?? entry.name);
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 lg:px-8">
      <ToolHeader tool={tool} />

      <FileDropzone
        accept=".zip,application/zip"
        label="Click to choose a .zip file"
        hint="Extracted entirely in your browser — nothing is uploaded."
        onFiles={handleFiles}
      />

      {error && <p className="text-sm text-danger">{error}</p>}

      {entries.length > 0 && (
        <Card className="flex flex-col divide-y divide-border p-0">
          {entries.map((entry) => (
            <div key={entry.name} className="flex flex-col gap-2 px-4 py-3">
              <div className="flex items-center gap-3">
                <Icons.File className="h-4 w-4 shrink-0 text-accent" strokeWidth={1.75} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{entry.name}</p>
                  <p className="text-xs text-muted">{formatBytes(entry.size)}</p>
                </div>
                <Button variant="secondary" onClick={() => downloadEntry(entry)}>
                  Download
                </Button>
              </div>
              {entry.textPreview && (
                <pre className="orbit-scrollbar max-h-32 overflow-y-auto rounded-lg bg-background p-3 text-xs">
                  {entry.textPreview}
                </pre>
              )}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
