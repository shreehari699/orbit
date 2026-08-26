import type { Metadata } from "next";

import { PdfCompressor } from "@/modules/tools/pdf-compressor/PdfCompressor";

export const metadata: Metadata = { title: "PDF Compressor" };

export default function PdfCompressorPage() {
  return <PdfCompressor />;
}
