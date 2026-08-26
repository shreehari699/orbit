"use client";

/**
 * Client-side OCR via Tesseract.js. On first use it downloads the OCR
 * engine (WASM) and the English trained-data model from Tesseract's CDN —
 * a one-time, several-megabyte fetch, cached by the browser afterward.
 * Recognition itself always runs locally; nothing is uploaded.
 */
export async function recognizeText(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<string> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng", 1, {
    logger: (m) => {
      if (m.status === "recognizing text" && typeof m.progress === "number") {
        onProgress?.(m.progress);
      }
    },
  });
  try {
    const {
      data: { text },
    } = await worker.recognize(file);
    return text;
  } finally {
    await worker.terminate();
  }
}
