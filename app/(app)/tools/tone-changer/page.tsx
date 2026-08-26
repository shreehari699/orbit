import type { Metadata } from "next";

import { ToneChanger } from "@/modules/tools/tone-changer/ToneChanger";

export const metadata: Metadata = { title: "Tone Changer" };

export default function ToneChangerPage() {
  return <ToneChanger />;
}
