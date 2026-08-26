"use client";

import { useEffect, useState } from "react";
import * as Icons from "lucide-react";

import { getToolById } from "@/registry/tools";
import { canvasToBlob, loadImageFromFile } from "@/lib/image/canvas";
import { downloadBlob } from "@/lib/files/download";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { FileDropzone } from "@/components/tools/FileDropzone";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const tool = getToolById("image-rotator")!;

export function ImageRotator() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [rotation, setRotation] = useState(0); // degrees, multiple of 90
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [blob, setBlob] = useState<Blob | null>(null);
  const [error, setError] = useState("");

  async function handleFiles(files: File[]) {
    const picked = files[0];
    if (!picked) return;
    setError("");
    try {
      setImage(await loadImageFromFile(picked));
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
    } catch {
      setError("Could not read this image.");
    }
  }

  useEffect(() => {
    if (!image) return;
    const swap = rotation % 180 !== 0;
    const w = image.naturalWidth;
    const h = image.naturalHeight;
    const canvas = document.createElement("canvas");
    canvas.width = swap ? h : w;
    canvas.height = swap ? w : h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.drawImage(image, -w / 2, -h / 2, w, h);

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
  }, [image, rotation, flipH, flipV]);

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
          <Card className="flex flex-wrap items-center gap-2 p-5">
            <Button variant="secondary" onClick={() => setRotation((r) => (r - 90 + 360) % 360)}>
              <Icons.RotateCcw className="h-4 w-4" strokeWidth={1.75} />
              Rotate left
            </Button>
            <Button variant="secondary" onClick={() => setRotation((r) => (r + 90) % 360)}>
              <Icons.RotateCw className="h-4 w-4" strokeWidth={1.75} />
              Rotate right
            </Button>
            <Button variant={flipH ? "primary" : "secondary"} onClick={() => setFlipH((v) => !v)}>
              <Icons.FlipHorizontal2 className="h-4 w-4" strokeWidth={1.75} />
              Flip horizontal
            </Button>
            <Button variant={flipV ? "primary" : "secondary"} onClick={() => setFlipV((v) => !v)}>
              <Icons.FlipVertical2 className="h-4 w-4" strokeWidth={1.75} />
              Flip vertical
            </Button>
            <Button variant="ghost" className="ml-auto" onClick={() => setImage(null)}>
              Choose another
            </Button>
          </Card>

          {previewUrl && (
            <Card className="flex flex-col items-center gap-4 p-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Rotated preview" className="max-h-80 rounded-lg object-contain" />
              <Button variant="primary" onClick={() => downloadBlob(blob!, "rotated.png")}>
                Download PNG
              </Button>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
