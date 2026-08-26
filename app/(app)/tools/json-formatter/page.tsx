import type { Metadata } from "next";

import { JsonFormatter } from "@/modules/tools/json-formatter/JsonFormatter";

export const metadata: Metadata = { title: "JSON Formatter" };

export default function JsonFormatterPage() {
  return <JsonFormatter />;
}
