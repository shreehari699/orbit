"use client";

/**
 * Loads a File into an HTMLImageElement via a blob URL. The URL is
 * deliberately NOT revoked here — several callers (the cropper, the
 * color extractor) reuse `image.src` as the `src` of a second `<img>`
 * for on-page preview, and a revoked blob URL fails to load in a new
 * element even though the original Image object already decoded it.
 * The tab-lifetime cost of one un-revoked URL per upload is negligible.
 */
export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read this image."));
    };
    img.src = url;
  });
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not encode image."))),
      type,
      quality,
    );
  });
}

export const IMAGE_MIME_TYPES = [
  { id: "image/jpeg", label: "JPEG", extension: "jpg" },
  { id: "image/png", label: "PNG", extension: "png" },
  { id: "image/webp", label: "WebP", extension: "webp" },
] as const;
