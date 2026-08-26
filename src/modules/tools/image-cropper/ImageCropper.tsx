"use client";

import { useRef, useState } from "react";

import { getToolById } from "@/registry/tools";
import { canvasToBlob, loadImageFromFile } from "@/lib/image/canvas";
import { downloadBlob } from "@/lib/files/download";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { FileDropzone } from "@/components/tools/FileDropzone";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const tool = getToolById("image-cropper")!;

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function ImageCropper() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [src, setSrc] = useState("");
  const [rect, setRect] = useState<Rect | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [croppedUrl, setCroppedUrl] = useState("");
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState("");
  const imgRef = useRef<HTMLImageElement>(null);

  async function handleFiles(files: File[]) {
    const picked = files[0];
    if (!picked) return;
    setError("");
    setRect(null);
    setCroppedUrl("");
    try {
      const img = await loadImageFromFile(picked);
      setImage(img);
      setSrc(img.src);
    } catch {
      setError("Could not read this image.");
    }
  }

  function relativePos(e: React.PointerEvent) {
    const box = imgRef.current!.getBoundingClientRect();
    const x = Math.min(Math.max(e.clientX - box.left, 0), box.width);
    const y = Math.min(Math.max(e.clientY - box.top, 0), box.height);
    return { x, y, box };
  }

  function onPointerDown(e: React.PointerEvent) {
    const { x, y } = relativePos(e);
    setDragStart({ x, y });
    setRect({ x, y, w: 0, h: 0 });
    setCroppedUrl("");
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragStart) return;
    const { x, y } = relativePos(e);
    setRect({
      x: Math.min(dragStart.x, x),
      y: Math.min(dragStart.y, y),
      w: Math.abs(x - dragStart.x),
      h: Math.abs(y - dragStart.y),
    });
  }

  function onPointerUp() {
    setDragStart(null);
  }

  async function applyCrop() {
    if (!image || !rect || rect.w < 2 || rect.h < 2 || !imgRef.current) return;
    const displayedWidth = imgRef.current.clientWidth;
    const scale = image.naturalWidth / displayedWidth;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(rect.w * scale);
    canvas.height = Math.round(rect.h * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(
      image,
      rect.x * scale,
      rect.y * scale,
      rect.w * scale,
      rect.h * scale,
      0,
      0,
      canvas.width,
      canvas.height,
    );
    const blob = await canvasToBlob(canvas, "image/png");
    setCroppedBlob(blob);
    setCroppedUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(blob);
    });
  }

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
          <Card className="p-5">
            <p className="mb-3 text-sm text-muted">Drag on the image below to select a crop area.</p>
            <div
              className="relative w-full touch-none select-none"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img ref={imgRef} src={src} alt="To crop" draggable={false} className="block w-full rounded-lg" />
              {rect && rect.w > 0 && rect.h > 0 && (
                <div
                  className="pointer-events-none absolute border-2 border-accent bg-accent/15"
                  style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
                />
              )}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Button
                variant="primary"
                onClick={applyCrop}
                disabled={!rect || rect.w < 2 || rect.h < 2}
              >
                Apply crop
              </Button>
              <Button variant="ghost" onClick={() => setImage(null)}>
                Choose another
              </Button>
            </div>
          </Card>

          {croppedUrl && (
            <Card className="flex flex-col items-center gap-4 p-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={croppedUrl} alt="Cropped result" className="max-h-80 rounded-lg object-contain" />
              <Button variant="primary" onClick={() => downloadBlob(croppedBlob!, "cropped.png")}>
                Download PNG
              </Button>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
