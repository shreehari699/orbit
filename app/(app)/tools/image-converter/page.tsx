import type { Metadata } from "next";

import { ImageConverter } from "@/modules/tools/image-converter/ImageConverter";

export const metadata: Metadata = { title: "Image Converter" };

export default function ImageConverterPage() {
  return <ImageConverter />;
}
