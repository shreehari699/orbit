"use client";

import { useEffect, useState } from "react";

import { getToolById } from "@/registry/tools";
import { renderPdfPagesToPngs } from "@/lib/pdf/render";
import { createZip } from "@/lib/files/zip";
import { downloadBlob } from "@/lib/files/download";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { FileDropzone } from "@/components/tools/FileDropzone";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const tool = getToolById("pdf-to-images")!;

export function PdfToImages() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "working">("idle");
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState("");
  const [pages, setPages] = useState<{ name: string; blob: Blob }[]>([]);
  const [pageUrls, setPageUrls] = useState<string[]>([]);

  useEffect(() => {
    const urls = pages.map((page) => URL.createObjectURL(page.blob));
    setPageUrls(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [pages]);

  async function handleFiles(files: File[]) {
    const picked = files[0];
    if (!picked) return;
    setFile(picked);
    setPages([]);
    setError("");
    setStatus("working");
    try {
      const result = await renderPdfPagesToPngs(picked, 2, (done, total) => setProgress({ done, total }));
      setPages(result);
    } catch {
      setError("Could not render this PDF.");
    } finally {
      setStatus("idle");
    }
  }

  async function handleDownloadAll() {
    const zip = await createZip(pages);
    downloadBlob(zip, `${file?.name.replace(/\.pdf$/i, "") ?? "pages"}.zip`);
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 lg:px-8">
      <ToolHeader tool={tool} />

      {!file && (
        <FileDropzone
          accept="application/pdf"
          label="Click to choose a PDF"
          hint="Rendered entirely in your browser — nothing is uploaded."
          onFiles={handleFiles}
        />
      )}

      {status === "working" && (
        <p className="text-sm text-muted">
          Rendering page {progress.done} of {progress.total || "…"}
        </p>
      )}
      {error && <p className="text-sm text-danger">{error}</p>}

      {pages.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">{pages.length} pages rendered</p>
            <div className="flex gap-2">
              <Button variant="primary" onClick={handleDownloadAll}>
                Download all as .zip
              </Button>
              <Button variant="ghost" onClick={() => setFile(null)}>
                Choose another
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {pages.map((page, i) => (
              <Card key={page.name} className="flex flex-col gap-2 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={pageUrls[i]} alt={page.name} className="w-full rounded object-contain" />
                <Button variant="secondary" onClick={() => downloadBlob(page.blob, page.name)} className="text-xs">
                  {page.name}
                </Button>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
