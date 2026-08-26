import type { Metadata } from "next";

import { ImagesToPdf } from "@/modules/tools/images-to-pdf/ImagesToPdf";

export const metadata: Metadata = { title: "Images → PDF" };

export default function ImagesToPdfPage() {
  return <ImagesToPdf />;
}
