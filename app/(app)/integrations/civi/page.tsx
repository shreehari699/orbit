import type { Metadata } from "next";

import { IntegrationPage } from "@/components/apps/IntegrationPage";

export const metadata: Metadata = { title: "CIVI" };

export default function CiviIntegrationPage() {
  return (
    <IntegrationPage
      appId="civi"
      icon="Landmark"
      description="Zero Degree's civic/community product."
    />
  );
}
