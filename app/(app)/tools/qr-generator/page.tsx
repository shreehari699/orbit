import type { Metadata } from "next";

import { QrGenerator } from "@/modules/tools/qr-generator/QrGenerator";

export const metadata: Metadata = { title: "QR Code Generator" };

export default function QrGeneratorPage() {
  return <QrGenerator />;
}
