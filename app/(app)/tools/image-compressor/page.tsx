import type { Metadata } from "next";

import { ImageCompressor } from "@/modules/tools/image-compressor/ImageCompressor";

export const metadata: Metadata = { title: "Image Compressor" };

export default function ImageCompressorPage() {
  return <ImageCompressor />;
}
