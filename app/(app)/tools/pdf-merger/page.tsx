import type { Metadata } from "next";

import { PdfMerger } from "@/modules/tools/pdf-merger/PdfMerger";

export const metadata: Metadata = { title: "PDF Merger" };

export default function PdfMergerPage() {
  return <PdfMerger />;
}
