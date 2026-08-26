"use client";

let workerConfigured = false;

async function ensurePdfjs() {
  const pdfjsLib = await import("pdfjs-dist");
  if (!workerConfigured) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();
    workerConfigured = true;
  }
  return pdfjsLib;
}

/** Renders every page of a PDF to a PNG blob at the given scale (1 = 72 DPI-equivalent CSS pixels). */
export async function renderPdfPagesToPngs(
  file: File,
  scale = 2,
  onProgress?: (done: number, total: number) => void,
): Promise<{ name: string; blob: Blob }[]> {
  const pdfjsLib = await ensurePdfjs();
  const buffer = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: buffer }).promise;

  const results: { name: string; blob: Blob }[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport }).promise;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not encode page."))), "image/png");
    });
    results.push({ name: `page-${String(i).padStart(2, "0")}.png`, blob });
    onProgress?.(i, doc.numPages);
  }
  return results;
}
