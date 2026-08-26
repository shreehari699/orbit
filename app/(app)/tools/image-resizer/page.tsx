import type { Metadata } from "next";

import { ImageResizer } from "@/modules/tools/image-resizer/ImageResizer";

export const metadata: Metadata = { title: "Image Resizer" };

export default function ImageResizerPage() {
  return <ImageResizer />;
}
