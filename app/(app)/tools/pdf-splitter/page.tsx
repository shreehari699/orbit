import type { Metadata } from "next";

import { PdfSplitter } from "@/modules/tools/pdf-splitter/PdfSplitter";

export const metadata: Metadata = { title: "PDF Splitter" };

export default function PdfSplitterPage() {
  return <PdfSplitter />;
}
