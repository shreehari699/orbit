import type { Metadata } from "next";

import { MarkdownConverter } from "@/modules/tools/markdown-converter/MarkdownConverter";

export const metadata: Metadata = { title: "Markdown Converter" };

export default function MarkdownConverterPage() {
  return <MarkdownConverter />;
}
