import type { Metadata } from "next";

import { GrammarChecker } from "@/modules/tools/grammar-checker/GrammarChecker";

export const metadata: Metadata = { title: "Grammar Checker" };

export default function GrammarCheckerPage() {
  return <GrammarChecker />;
}
