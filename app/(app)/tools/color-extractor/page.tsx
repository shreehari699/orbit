import type { Metadata } from "next";

import { ColorExtractor } from "@/modules/tools/color-extractor/ColorExtractor";

export const metadata: Metadata = { title: "Color Extractor" };

export default function ColorExtractorPage() {
  return <ColorExtractor />;
}
