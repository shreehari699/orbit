"use client";

import { useEffect, useState } from "react";

import { getToolById } from "@/registry/tools";
import { canvasToBlob, loadImageFromFile } from "@/lib/image/canvas";
import { downloadBlob } from "@/lib/files/download";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { FileDropzone } from "@/components/tools/FileDropzone";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const tool = getToolById("image-resizer")!;

export function ImageResizer() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lockAspect, setLockAspect] = useState(true);
  const [previewUrl, setPreviewUrl] = useState("");
  const [blob, setBlob] = useState<Blob | null>(null);
  const [error, setError] = useState("");

  async function handleFiles(files: File[]) {
    const picked = files[0];
    if (!picked) return;
    setError("");
    try {
      const img = await loadImageFromFile(picked);
      setImage(img);
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
    } catch {
      setError("Could not read this image.");
    }
  }

  function onWidthChange(next: number) {
    if (lockAspect && image) {
      const ratio = image.naturalHeight / image.naturalWidth;
      setHeight(Math.round(next * ratio));
    }
    setWidth(next);
  }

  function onHeightChange(next: number) {
    if (lockAspect && image) {
      const ratio = image.naturalWidth / image.naturalHeight;
      setWidth(Math.round(next * ratio));
    }
    setHeight(next);
  }

  useEffect(() => {
    if (!image || width <= 0 || height <= 0) return;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(image, 0, 0, width, height);
    let cancelled = false;
    canvasToBlob(canvas, "image/png").then((b) => {
      if (cancelled) return;
      setBlob(b);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(b);
      });
    });
    return () => {
      cancelled = true;
    };
  }, [image, width, height]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 lg:px-8">
      <ToolHeader tool={tool} />

      {!image && (
        <FileDropzone
          accept="image/*"
          label="Click to choose an image"
          hint="Processed entirely in your browser — nothing is uploaded."
          onFiles={handleFiles}
        />
      )}
      {error && <p className="text-sm text-danger">{error}</p>}

      {image && (
        <>
          <Card className="flex flex-col gap-4 p-5">
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-xs font-medium uppercase tracking-wide text-muted">Width</span>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => onWidthChange(Number(e.target.value))}
                  className="rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-accent/50"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-xs font-medium uppercase tracking-wide text-muted">Height</span>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => onHeightChange(Number(e.target.value))}
                  className="rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-accent/50"
                />
              </label>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={lockAspect}
                  onChange={(e) => setLockAspect(e.target.checked)}
                  className="h-4 w-4 accent-accent"
                />
                Lock aspect ratio
              </label>
              <Button variant="ghost" onClick={() => setImage(null)}>
                Choose another
              </Button>
            </div>
          </Card>

          {previewUrl && (
            <Card className="flex flex-col items-center gap-4 p-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Resized preview" className="max-h-80 rounded-lg object-contain" />
              <p className="text-sm text-muted">
                {width} × {height}px
              </p>
              <Button variant="primary" onClick={() => downloadBlob(blob!, "resized.png")}>
                Download PNG
              </Button>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
