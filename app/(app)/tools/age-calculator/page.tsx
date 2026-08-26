import type { Metadata } from "next";

import { AgeCalculator } from "@/modules/tools/age-calculator/AgeCalculator";

export const metadata: Metadata = { title: "Age Calculator" };

export default function AgeCalculatorPage() {
  return <AgeCalculator />;
}
