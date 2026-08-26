"use client";

import { useEffect, useState } from "react";
import * as Icons from "lucide-react";

import { TOOLS } from "@/registry/tools";
import { getFavorites } from "@/lib/workspace/favorites";
import { clearHistory, getHistory } from "@/lib/workspace/history";
import type { HistoryEntry } from "@/lib/workspace/types";
import { ToolCard } from "@/components/tools/ToolCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export function HistoryView() {
  const [history, setHistory] = useState<HistoryEntry[] | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setHistory(getHistory());
    setFavoriteIds(new Set(getFavorites().map((f) => f.toolId)));
  }, []);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10 lg:px-8">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icons.History className="h-5 w-5 text-accent" strokeWidth={1.75} />
          <h1 className="text-2xl font-semibold tracking-tight">History</h1>
        </div>
        {history && history.length > 0 && (
          <Button variant="ghost" onClick={() => setHistory(clearHistory())}>
            <Icons.Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            Clear
          </Button>
        )}
      </div>

      {history === null ? null : history.length === 0 ? (
        <EmptyState icon="History" title="No activity yet" description="Tools you open will show up here." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {history.map((entry) => {
            const tool = TOOLS.find((t) => t.id === entry.toolId);
            if (!tool) return null;
            return (
              <ToolCard
                key={`${tool.id}-${entry.at}`}
                tool={tool}
                favorited={favoriteIds.has(tool.id)}
                onFavoriteChange={() => setFavoriteIds(new Set(getFavorites().map((f) => f.toolId)))}
                meta={`Opened ${new Date(entry.at).toLocaleString()}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
