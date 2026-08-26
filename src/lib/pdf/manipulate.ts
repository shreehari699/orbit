"use client";

import { PDFDocument } from "pdf-lib";

export async function mergePdfs(files: File[]): Promise<Uint8Array> {
  const merged = await PDFDocument.create();
  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const source = await PDFDocument.load(bytes);
    const pages = await merged.copyPages(source, source.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }
  return merged.save();
}

/** Parses "1,3,5-7" into a zero-based, de-duplicated, in-order page index list. Throws on an out-of-range or malformed entry. */
export function parsePageRange(spec: string, pageCount: number): number[] {
  const indices = new Set<number>();
  for (const part of spec.split(",").map((p) => p.trim()).filter(Boolean)) {
    const rangeMatch = part.match(/^(\d+)\s*-\s*(\d+)$/);
    if (rangeMatch) {
      const start = Number(rangeMatch[1]);
      const end = Number(rangeMatch[2]);
      if (start < 1 || end > pageCount || start > end) {
        throw new Error(`"${part}" is out of range (this PDF has ${pageCount} pages).`);
      }
      for (let i = start; i <= end; i++) indices.add(i - 1);
      continue;
    }
    const n = Number(part);
    if (!Number.isInteger(n) || n < 1 || n > pageCount) {
      throw new Error(`"${part}" is not a valid page number (1-${pageCount}).`);
    }
    indices.add(n - 1);
  }
  return Array.from(indices).sort((a, b) => a - b);
}

export async function extractPages(file: File, pageIndices: number[]): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const source = await PDFDocument.load(bytes);
  const result = await PDFDocument.create();
  const pages = await result.copyPages(source, pageIndices);
  pages.forEach((page) => result.addPage(page));
  return result.save();
}

export async function getPdfPageCount(file: File): Promise<number> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  return doc.getPageCount();
}

export async function imagesToPdf(files: File[]): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const isPng = file.type === "image/png";
    const image = isPng ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
    const page = doc.addPage([image.width, image.height]);
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
  }
  return doc.save();
}
