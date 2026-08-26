import type { Metadata } from "next";

import { PasswordGenerator } from "@/modules/tools/password-generator/PasswordGenerator";

export const metadata: Metadata = { title: "Password Generator" };

export default function PasswordGeneratorPage() {
  return <PasswordGenerator />;
}
