import type { Metadata } from "next";

import { ImageToText } from "@/modules/tools/image-to-text/ImageToText";

export const metadata: Metadata = { title: "Image → Text (OCR)" };

export default function ImageToTextPage() {
  return <ImageToText />;
}
