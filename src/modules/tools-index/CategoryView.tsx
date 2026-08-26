"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import * as Icons from "lucide-react";

import { TOOLS, TOOL_CATEGORIES, type ToolCategory } from "@/registry/tools";
import { getFavorites } from "@/lib/workspace/favorites";
import { ToolCard } from "@/components/tools/ToolCard";
import { EmptyState } from "@/components/ui/EmptyState";

export function CategoryView({ categoryId }: { categoryId: ToolCategory }) {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const category = TOOL_CATEGORIES.find((c) => c.id === categoryId);
  const tools = TOOLS.filter((t) => t.category === categoryId);

  useEffect(() => {
    setFavoriteIds(new Set(getFavorites().map((f) => f.toolId)));
  }, []);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10 lg:px-8">
      <div>
        <Link href="/tools" className="mb-2 inline-flex items-center gap-1 text-xs text-muted hover:text-foreground">
          <Icons.ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          All categories
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">{category?.label ?? "Category"}</h1>
      </div>

      {tools.length === 0 ? (
        <EmptyState icon="Boxes" title="No tools in this category yet" />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              favorited={favoriteIds.has(tool.id)}
              onFavoriteChange={() => setFavoriteIds(new Set(getFavorites().map((f) => f.toolId)))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
