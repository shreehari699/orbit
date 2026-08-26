"use client";

import { useEffect, useMemo, useState } from "react";
import * as Icons from "lucide-react";

import { TOOLS, TOOL_CATEGORIES } from "@/registry/tools";
import { getQuickAnswer } from "@/registry/quick-answers";
import { searchTools } from "@/registry/search";
import { getFavorites } from "@/lib/workspace/favorites";
import { getHistory } from "@/lib/workspace/history";
import type { FavoriteEntry, HistoryEntry } from "@/lib/workspace/types";
import { ToolCard } from "@/components/tools/ToolCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion/primitives";
import { OrbitCore } from "@/components/motion/OrbitCore";

export function CommandCenter() {
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setFavorites(getFavorites());
    setHistory(getHistory());
  }, []);

  const quickAnswer = useMemo(() => getQuickAnswer(query), [query]);
  const searchResults = useMemo(() => (query.trim() ? searchTools(query) : []), [query]);
  const favoriteIds = useMemo(() => new Set(favorites.map((f) => f.toolId)), [favorites]);

  function refreshFavorites() {
    setFavorites(getFavorites());
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-10 lg:px-8">
      <div className="relative">
        <div
          className="pointer-events-none absolute -right-4 -top-10 hidden opacity-60 sm:block"
          aria-hidden="true"
        >
          <OrbitCore size={140} />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Command Center</h1>
        <p className="mt-1 text-sm text-muted">
          Search a tool, or type a question — “15% of 340”, “2 kg to lb”, “count: your text”.
        </p>
      </div>

      <div className="rounded-card border border-border bg-surface-raised p-2 shadow-[var(--shadow-card)] transition-colors focus-within:border-accent/40">
        <div className="flex items-center gap-2 px-3">
          <Icons.Sparkles className="h-4 w-4 shrink-0 text-accent" strokeWidth={1.75} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask ORBIT or search tools…"
            className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted"
          />
        </div>
        {quickAnswer && (
          <FadeIn className="mx-2 mb-1 rounded-control bg-accent/5 px-4 py-3">
            <div className="text-[11px] uppercase tracking-wide text-muted">Quick answer</div>
            <div className="mt-0.5 flex items-baseline gap-2">
              <span className="text-xl font-semibold">{quickAnswer.result}</span>
              {quickAnswer.detail && <span className="text-xs text-muted">{quickAnswer.detail}</span>}
            </div>
          </FadeIn>
        )}
      </div>

      {query.trim() ? (
        <section>
          <h2 className="mb-3 text-sm font-medium text-muted">
            {searchResults.length} result{searchResults.length === 1 ? "" : "s"}
          </h2>
          {searchResults.length === 0 ? (
            <EmptyState icon="SearchX" title="No tools match your search" />
          ) : (
            <StaggerContainer className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {searchResults.map(({ tool }) => (
                <StaggerItem key={tool.id}>
                  <ToolCard
                    tool={tool}
                    favorited={favoriteIds.has(tool.id)}
                    onFavoriteChange={refreshFavorites}
                  />
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </section>
      ) : (
        <>
          <section>
            <div className="mb-3 flex items-center gap-2">
              <Icons.Star className="h-4 w-4 text-accent" strokeWidth={1.75} />
              <h2 className="text-sm font-medium text-muted">Favorites</h2>
            </div>
            {favorites.length === 0 ? (
              <EmptyState
                icon="Star"
                title="No favorites yet"
                description="Star a tool to pin it here for one-tap access."
              />
            ) : (
              <StaggerContainer className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {favorites.map((fav) => {
                  const tool = TOOLS.find((t) => t.id === fav.toolId);
                  if (!tool) return null;
                  return (
                    <StaggerItem key={tool.id}>
                      <ToolCard tool={tool} favorited onFavoriteChange={refreshFavorites} />
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>
            )}
          </section>

          <section>
            <div className="mb-3 flex items-center gap-2">
              <Icons.History className="h-4 w-4 text-accent" strokeWidth={1.75} />
              <h2 className="text-sm font-medium text-muted">Recent</h2>
            </div>
            {history.length === 0 ? (
              <EmptyState icon="History" title="No activity yet" description="Tools you open will show up here." />
            ) : (
              <StaggerContainer className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {history.slice(0, 6).map((entry) => {
                  const tool = TOOLS.find((t) => t.id === entry.toolId);
                  if (!tool) return null;
                  return (
                    <StaggerItem key={`${tool.id}-${entry.at}`}>
                      <ToolCard
                        tool={tool}
                        favorited={favoriteIds.has(tool.id)}
                        onFavoriteChange={refreshFavorites}
                        meta={`Opened ${new Date(entry.at).toLocaleString()}`}
                      />
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>
            )}
          </section>

          {TOOL_CATEGORIES.map((category) => {
            const items = TOOLS.filter((t) => t.category === category.id);
            if (items.length === 0) return null;
            return (
              <section key={category.id}>
                <h2 className="mb-3 text-sm font-medium text-muted">{category.label}</h2>
                <StaggerContainer className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((tool) => (
                    <StaggerItem key={tool.id}>
                      <ToolCard
                        tool={tool}
                        favorited={favoriteIds.has(tool.id)}
                        onFavoriteChange={refreshFavorites}
                      />
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </section>
            );
          })}
        </>
      )}
    </div>
  );
}
