import type { Metadata } from "next";

import { ToolsIndexView } from "@/modules/tools-index/ToolsIndexView";

export const metadata: Metadata = { title: "Tools" };

export default function ToolsIndexPage() {
  return <ToolsIndexView />;
}
