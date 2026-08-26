"use client";

import { useEffect, useState } from "react";

import { getToolById } from "@/registry/tools";
import { canvasToBlob, loadImageFromFile, IMAGE_MIME_TYPES } from "@/lib/image/canvas";
import { downloadBlob } from "@/lib/files/download";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { FileDropzone } from "@/components/tools/FileDropzone";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const tool = getToolById("image-converter")!;

export function ImageConverter() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [target, setTarget] = useState<(typeof IMAGE_MIME_TYPES)[number]>(IMAGE_MIME_TYPES[1]);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");

  async function handleFiles(files: File[]) {
    const picked = files[0];
    if (!picked) return;
    setError("");
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
    if (target.id !== "image/png") {
      // Flatten transparency onto white for formats without an alpha channel.
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(image, 0, 0);
    let cancelled = false;
    canvasToBlob(canvas, target.id, 0.92).then((b) => {
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
  }, [image, target]);

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
          <Card className="flex items-center gap-2 p-5">
            {IMAGE_MIME_TYPES.map((t) => (
              <Button key={t.id} variant={target.id === t.id ? "primary" : "secondary"} onClick={() => setTarget(t)}>
                {t.label}
              </Button>
            ))}
            <Button variant="ghost" className="ml-auto" onClick={() => setImage(null)}>
              Choose another
            </Button>
          </Card>

          {previewUrl && (
            <Card className="flex flex-col items-center gap-4 p-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Converted preview" className="max-h-80 rounded-lg object-contain" />
              <Button variant="primary" onClick={() => downloadBlob(blob!, `converted.${target.extension}`)}>
                Download {target.label}
              </Button>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
