"use client";

import { zipSync, unzipSync, strFromU8 } from "fflate";

export async function createZip(files: { name: string; blob: Blob }[]): Promise<Blob> {
  const entries: Record<string, Uint8Array> = {};
  for (const file of files) {
    entries[file.name] = new Uint8Array(await file.blob.arrayBuffer());
  }
  const zipped = zipSync(entries, { level: 6 });
  return new Blob([zipped.buffer as ArrayBuffer], { type: "application/zip" });
}

export interface ExtractedFile {
  name: string;
  size: number;
  bytes: Uint8Array;
  isText: boolean;
  textPreview?: string;
}

const TEXT_EXTENSIONS = new Set(["txt", "json", "csv", "md", "xml", "html", "css", "js", "ts"]);

export async function extractZip(file: File): Promise<ExtractedFile[]> {
  const buffer = new Uint8Array(await file.arrayBuffer());
  const entries = unzipSync(buffer);
  return Object.entries(entries)
    .filter(([name]) => !name.endsWith("/"))
    .map(([name, bytes]) => {
      const extension = name.split(".").pop()?.toLowerCase() ?? "";
      const isText = TEXT_EXTENSIONS.has(extension);
      return {
        name,
        size: bytes.length,
        bytes,
        isText,
        textPreview: isText ? strFromU8(bytes).slice(0, 2000) : undefined,
      };
    });
}
