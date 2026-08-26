import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TOOL_CATEGORIES } from "@/registry/tools";
import { CategoryView } from "@/modules/tools-index/CategoryView";

export function generateStaticParams() {
  return TOOL_CATEGORIES.map((c) => ({ id: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const category = TOOL_CATEGORIES.find((c) => c.id === id);
  return { title: category?.label ?? "Category" };
}

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = TOOL_CATEGORIES.find((c) => c.id === id);
  if (!category) notFound();
  return <CategoryView categoryId={category.id} />;
}
