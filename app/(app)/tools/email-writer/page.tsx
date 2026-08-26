import type { Metadata } from "next";

import { EmailWriter } from "@/modules/tools/email-writer/EmailWriter";

export const metadata: Metadata = { title: "Email Writer" };

export default function EmailWriterPage() {
  return <EmailWriter />;
}
