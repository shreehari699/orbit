import type { Metadata } from "next";

import { PdfIntelligence } from "@/modules/pdf-intelligence/PdfIntelligence";

export const metadata: Metadata = { title: "PDF Intelligence" };

export default function PdfIntelligencePage() {
  return <PdfIntelligence />;
}
