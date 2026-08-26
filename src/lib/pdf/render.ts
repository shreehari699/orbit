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

export interface RenderedPage {
  name: string;
  blob: Blob;
  widthPt: number;
  heightPt: number;
}

/** Renders every page of a PDF to an image blob at the given scale (1 = 72 DPI-equivalent CSS pixels). Also returns each page's original PDF-point size, needed to rebuild a same-proportioned PDF from the images. */
export async function renderPdfPages(
  file: File,
  options: { scale?: number; mimeType?: string; quality?: number } = {},
  onProgress?: (done: number, total: number) => void,
): Promise<RenderedPage[]> {
  const { scale = 2, mimeType = "image/png", quality } = options;
  const pdfjsLib = await ensurePdfjs();
  const buffer = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: buffer }).promise;

  const results: RenderedPage[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const unscaledViewport = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;
    if (mimeType === "image/jpeg") {
      // JPEG has no alpha channel — an unfilled background renders black.
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    await page.render({ canvasContext: ctx, viewport }).promise;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Could not encode page."))),
        mimeType,
        quality,
      );
    });
    results.push({
      name: `page-${String(i).padStart(2, "0")}.${mimeType === "image/jpeg" ? "jpg" : "png"}`,
      blob,
      widthPt: unscaledViewport.width,
      heightPt: unscaledViewport.height,
    });
    onProgress?.(i, doc.numPages);
  }
  return results;
}

/** Renders every page of a PDF to a PNG blob at the given scale — the existing PDF → Images tool's shape, unchanged. */
export async function renderPdfPagesToPngs(
  file: File,
  scale = 2,
  onProgress?: (done: number, total: number) => void,
): Promise<{ name: string; blob: Blob }[]> {
  const pages = await renderPdfPages(file, { scale, mimeType: "image/png" }, onProgress);
  return pages.map(({ name, blob }) => ({ name, blob }));
}
