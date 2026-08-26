import type { Metadata } from "next";

import { AiAssistant } from "@/modules/assistant/AiAssistant";

export const metadata: Metadata = { title: "ORBIT Assistant" };

export default function AssistantPage() {
  return <AiAssistant />;
}
