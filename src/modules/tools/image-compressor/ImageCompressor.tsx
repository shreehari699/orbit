"use client";

import { useEffect, useMemo, useState } from "react";

import { getToolById } from "@/registry/tools";
import { canvasToBlob, loadImageFromFile } from "@/lib/image/canvas";
import { downloadBlob, formatBytes } from "@/lib/files/download";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { FileDropzone } from "@/components/tools/FileDropzone";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const tool = getToolById("image-compressor")!;
type Format = "image/jpeg" | "image/webp";

export function ImageCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [quality, setQuality] = useState(0.75);
  const [format, setFormat] = useState<Format>("image/jpeg");
  const [blob, setBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");

  async function handleFiles(files: File[]) {
    const picked = files[0];
    if (!picked) return;
    setError("");
    setFile(picked);
    try {
      setImage(await loadImageFromFile(picked));
    } catch {
      setError("Could not read this image.");
    }
  }

  useEffect(() => {
    if (!image) return;
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(image, 0, 0);
    let cancelled = false;
    canvasToBlob(canvas, format, quality).then((b) => {
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
  }, [image, format, quality]);

  const savings = useMemo(() => {
    if (!file || !blob) return null;
    return Math.round((1 - blob.size / file.size) * 100);
  }, [file, blob]);

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
            <div className="flex items-center gap-2">
              {(["image/jpeg", "image/webp"] as Format[]).map((f) => (
                <Button key={f} variant={format === f ? "primary" : "secondary"} onClick={() => setFormat(f)}>
                  {f === "image/jpeg" ? "JPEG" : "WebP"}
                </Button>
              ))}
              <Button variant="ghost" className="ml-auto" onClick={() => setImage(null)}>
                Choose another
              </Button>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span>Quality</span>
                <span className="tabular-nums text-muted">{Math.round(quality * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-accent"
              />
            </div>
          </Card>

          {previewUrl && (
            <Card className="flex flex-col items-center gap-4 p-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Compressed preview" className="max-h-80 rounded-lg object-contain" />
              <div className="flex items-center gap-4 text-sm text-muted">
                <span>
                  Original: <strong className="text-foreground">{formatBytes(file!.size)}</strong>
                </span>
                <span>
                  Compressed: <strong className="text-foreground">{formatBytes(blob!.size)}</strong>
                </span>
                {savings !== null && savings > 0 && (
                  <span className="text-success">-{savings}%</span>
                )}
              </div>
              <Button
                variant="primary"
                onClick={() => downloadBlob(blob!, `compressed.${format === "image/jpeg" ? "jpg" : "webp"}`)}
              >
                Download
              </Button>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
