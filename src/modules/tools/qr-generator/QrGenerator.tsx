"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

import { getToolById } from "@/registry/tools";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { Button } from "@/components/ui/Button";
import { downloadBlob } from "@/lib/files/download";

const tool = getToolById("qr-generator")!;

export function QrGenerator() {
  const [text, setText] = useState("https://");
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!text.trim()) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    QRCode.toCanvas(canvas, text, { width: 288, margin: 1 }, (err) => {
      setError(err ? "Could not encode this text as a QR code." : "");
    });
  }, [text]);

  async function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, "orbit-qr-code.png");
    }, "image/png");
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10 lg:px-8">
      <ToolHeader tool={tool} />

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter a URL or any text…"
        rows={3}
        className="w-full resize-y rounded-2xl border border-border bg-surface p-4 text-sm outline-none placeholder:text-muted focus:border-accent/50"
      />

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-8">
        <canvas ref={canvasRef} width={288} height={288} className="rounded-lg" />
        <Button variant="primary" onClick={handleDownload} disabled={!text.trim() || !!error}>
          Download PNG
        </Button>
      </div>
    </div>
  );
}
