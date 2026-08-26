/**
 * Client-side PDF text extraction via pdfjs-dist. Runs entirely in the
 * browser — nothing is uploaded anywhere, so page count, word count, and
 * extracted text are real regardless of whether an AI provider is
 * configured for the optional summary step.
 */

export interface PdfExtractionResult {
  pageCount: number;
  text: string;
  words: number;
  characters: number;
  readingMinutes: number;
}

let workerConfigured = false;

export async function extractPdf(file: File): Promise<PdfExtractionResult> {
  const pdfjsLib = await import("pdfjs-dist");

  if (!workerConfigured) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();
    workerConfigured = true;
  }

  const buffer = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: buffer }).promise;

  const pageTexts: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    pageTexts.push(pageText);
  }

  const text = pageTexts.join("\n\n").replace(/[ \t]+/g, " ").trim();
  const words = text ? text.split(/\s+/).filter(Boolean).length : 0;

  return {
    pageCount: doc.numPages,
    text,
    words,
    characters: text.length,
    readingMinutes: words / 200,
  };
}
