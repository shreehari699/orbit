import type { Metadata } from "next";

import { ZipCreator } from "@/modules/tools/zip-creator/ZipCreator";

export const metadata: Metadata = { title: "ZIP Creator" };

export default function ZipCreatorPage() {
  return <ZipCreator />;
}
