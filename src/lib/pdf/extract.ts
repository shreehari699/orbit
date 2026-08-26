/**
 * Client-side PDF text extraction via pdfjs-dist. Runs entirely in the
 * browser — nothing is uploaded anywhere, so page count, word count, and
 * extracted text are real regardless of whether an AI provider is
 * configured for the optional summary/Q&A steps.
 */

export interface PdfExtractionResult {
  pageCount: number;
  /** Full text, each page prefixed with a "[Page N]" marker so an AI
   * grounding prompt (and a human) can cite where an answer came from. */
  text: string;
  /** Per-page text, unmarked — for callers that need to address a single page directly. */
  pages: string[];
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

  const pages: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/[ \t]+/g, " ")
      .trim();
    pages.push(pageText);
  }

  const text = pages.map((pageText, i) => `[Page ${i + 1}]\n${pageText}`).join("\n\n");
  const plainWordSource = pages.join(" ");
  const words = plainWordSource.trim() ? plainWordSource.trim().split(/\s+/).filter(Boolean).length : 0;

  return {
    pageCount: doc.numPages,
    text,
    pages,
    words,
    characters: plainWordSource.length,
    readingMinutes: words / 200,
  };
}
