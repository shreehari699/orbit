import type { Metadata } from "next";

import { IntegrationPage } from "@/components/apps/IntegrationPage";

export const metadata: Metadata = { title: "LOOP" };

export default function LoopIntegrationPage() {
  return (
    <IntegrationPage
      appId="loop"
      icon="Repeat"
      description="Zero Degree's workflow & automation product."
    />
  );
}
