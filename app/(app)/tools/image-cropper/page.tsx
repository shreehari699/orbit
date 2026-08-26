import type { Metadata } from "next";

import { ImageCropper } from "@/modules/tools/image-cropper/ImageCropper";

export const metadata: Metadata = { title: "Image Cropper" };

export default function ImageCropperPage() {
  return <ImageCropper />;
}
