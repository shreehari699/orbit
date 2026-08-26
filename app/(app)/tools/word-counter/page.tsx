import type { Metadata } from "next";

import { WordCounter } from "@/modules/tools/word-counter/WordCounter";

export const metadata: Metadata = { title: "Word & Character Counter" };

export default function WordCounterPage() {
  return <WordCounter />;
}
