import type { Metadata } from "next";

import { ZipExtractor } from "@/modules/tools/zip-extractor/ZipExtractor";

export const metadata: Metadata = { title: "ZIP Extractor" };

export default function ZipExtractorPage() {
  return <ZipExtractor />;
}
