import type { Metadata } from "next";

import { Paraphraser } from "@/modules/tools/paraphraser/Paraphraser";

export const metadata: Metadata = { title: "Paraphraser" };

export default function ParaphraserPage() {
  return <Paraphraser />;
}
