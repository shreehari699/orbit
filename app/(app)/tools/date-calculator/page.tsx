import type { Metadata } from "next";

import { DateCalculator } from "@/modules/tools/date-calculator/DateCalculator";

export const metadata: Metadata = { title: "Date Calculator" };

export default function DateCalculatorPage() {
  return <DateCalculator />;
}
