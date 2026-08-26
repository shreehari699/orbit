"use client";

import { useEffect, useState } from "react";
import * as Icons from "lucide-react";

import { TOOLS } from "@/registry/tools";
import { getFavorites } from "@/lib/workspace/favorites";
import type { FavoriteEntry } from "@/lib/workspace/types";
import { ToolCard } from "@/components/tools/ToolCard";
import { EmptyState } from "@/components/ui/EmptyState";

export function FavoritesView() {
  const [favorites, setFavorites] = useState<FavoriteEntry[] | null>(null);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10 lg:px-8">
      <div className="flex items-center gap-2">
        <Icons.Star className="h-5 w-5 text-accent" strokeWidth={1.75} />
        <h1 className="text-2xl font-semibold tracking-tight">Favorites</h1>
      </div>

      {favorites === null ? null : favorites.length === 0 ? (
        <EmptyState
          icon="Star"
          title="No favorites yet"
          description="Star any tool from the Command Center, Search, or its own page to pin it here."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((fav) => {
            const tool = TOOLS.find((t) => t.id === fav.toolId);
            if (!tool) return null;
            return (
              <ToolCard
                key={tool.id}
                tool={tool}
                favorited
                onFavoriteChange={() => setFavorites(getFavorites())}
                meta={`Pinned ${new Date(fav.addedAt).toLocaleDateString()}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
