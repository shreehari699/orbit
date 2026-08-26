import type { Metadata } from "next";

import { PdfToImages } from "@/modules/tools/pdf-to-images/PdfToImages";

export const metadata: Metadata = { title: "PDF → Images" };

export default function PdfToImagesPage() {
  return <PdfToImages />;
}
