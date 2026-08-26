import type { Metadata } from "next";

import { Base64Tool } from "@/modules/tools/base64/Base64Tool";

export const metadata: Metadata = { title: "Base64 Encoder / Decoder" };

export default function Base64Page() {
  return <Base64Tool />;
}
