import type { Metadata } from "next";

import { UnitConverter } from "@/modules/tools/unit-converter/UnitConverter";

export const metadata: Metadata = { title: "Unit Converter" };

export default function UnitConverterPage() {
  return <UnitConverter />;
}
