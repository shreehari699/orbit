import type { Metadata } from "next";

import { TextSummarizer } from "@/modules/tools/text-summarizer/TextSummarizer";

export const metadata: Metadata = { title: "Text Summarizer" };

export default function TextSummarizerPage() {
  return <TextSummarizer />;
}
