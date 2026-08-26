import type { Metadata } from "next";

import { SearchView } from "@/modules/search/SearchView";

export const metadata: Metadata = { title: "Search" };

export default function SearchPage() {
  return <SearchView />;
}
