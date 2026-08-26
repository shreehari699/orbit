import type { Metadata } from "next";

import { PercentageCalculator } from "@/modules/tools/percentage-calculator/PercentageCalculator";

export const metadata: Metadata = { title: "Percentage Calculator" };

export default function PercentageCalculatorPage() {
  return <PercentageCalculator />;
}
