import type { Metadata } from "next";

import { CsvJsonTool } from "@/modules/tools/csv-json/CsvJsonTool";

export const metadata: Metadata = { title: "CSV ⇄ JSON" };

export default function CsvJsonPage() {
  return <CsvJsonTool />;
}
