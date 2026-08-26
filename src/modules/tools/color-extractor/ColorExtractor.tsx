"use client";

import { useEffect, useState } from "react";

import { getToolById } from "@/registry/tools";
import { loadImageFromFile } from "@/lib/image/canvas";
import { extractPalette, type Swatch } from "@/lib/image/palette";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { FileDropzone } from "@/components/tools/FileDropzone";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";

const tool = getToolById("color-extractor")!;

export function ColorExtractor() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [src, setSrc] = useState("");
  const [palette, setPalette] = useState<Swatch[]>([]);
  const [error, setError] = useState("");

  async function handleFiles(files: File[]) {
    const picked = files[0];
    if (!picked) return;
    setError("");
    try {
      const img = await loadImageFromFile(picked);
      setImage(img);
      setSrc(img.src);
    } catch {
      setError("Could not read this image.");
    }
  }

  useEffect(() => {
    if (!image) return;
    setPalette(extractPalette(image, 6));
  }, [image]);

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
          <Card className="flex flex-col items-center gap-4 p-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="Source" className="max-h-64 rounded-lg object-contain" />
            <Button variant="ghost" onClick={() => setImage(null)}>
              Choose another
            </Button>
          </Card>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {palette.map((swatch) => (
              <Card key={swatch.hex} className="flex flex-col gap-2 overflow-hidden p-0">
                <div className="h-16" style={{ backgroundColor: swatch.hex }} />
                <div className="flex items-center justify-between px-3 pb-3">
                  <div>
                    <p className="font-mono text-sm">{swatch.hex}</p>
                    <p className="text-xs text-muted">{swatch.percent}%</p>
                  </div>
                  <CopyButton value={swatch.hex} />
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
