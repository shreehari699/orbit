import type { Metadata } from "next";

import { TextCaseConverter } from "@/modules/tools/text-case/TextCaseConverter";

export const metadata: Metadata = { title: "Text Case Converter" };

export default function TextCasePage() {
  return <TextCaseConverter />;
}
