import type { Metadata } from "next";

import { TextRewriter } from "@/modules/tools/text-rewriter/TextRewriter";

export const metadata: Metadata = { title: "Text Rewriter" };

export default function TextRewriterPage() {
  return <TextRewriter />;
}
