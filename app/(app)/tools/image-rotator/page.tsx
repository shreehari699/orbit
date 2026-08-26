import type { Metadata } from "next";

import { ImageRotator } from "@/modules/tools/image-rotator/ImageRotator";

export const metadata: Metadata = { title: "Image Rotator" };

export default function ImageRotatorPage() {
  return <ImageRotator />;
}
