"use client";

import { useEffect, useMemo, useState } from "react";
import * as Icons from "lucide-react";

import { searchTools } from "@/registry/search";
import { getQuickAnswer } from "@/registry/quick-answers";
import { getFavorites } from "@/lib/workspace/favorites";
import { ToolCard } from "@/components/tools/ToolCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { WebResults } from "@/components/search/WebResults";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion/primitives";

/**
 * The dedicated Search surface — the same engine as the Cmd+K palette, but
 * full-page: every result visible at once, no truncation, useful when
 * scanning the whole registry rather than jumping straight to one tool.
 */
export function SearchView() {
  const [query, setQuery] = useState("");
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setFavoriteIds(new Set(getFavorites().map((f) => f.toolId)));
  }, []);

  const quickAnswer = useMemo(() => getQuickAnswer(query), [query]);
  const results = useMemo(() => searchTools(query), [query]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10 lg:px-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">ORBIT Search</h1>
        <p className="mt-1 text-sm text-muted">Search every tool in the registry.</p>
      </div>

      <div className="flex items-center gap-2 rounded-card border border-border bg-surface-raised px-4 py-3 shadow-[var(--shadow-card)] transition-colors focus-within:border-accent/40">
        <Icons.Search className="h-4 w-4 shrink-0 text-muted" strokeWidth={1.75} />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tools by name, description, or keyword…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
        />
      </div>

      {quickAnswer && (
        <FadeIn className="rounded-card bg-accent/5 px-4 py-3">
          <div className="text-[11px] uppercase tracking-wide text-muted">Quick answer</div>
          <div className="mt-0.5 flex items-baseline gap-2">
            <span className="text-xl font-semibold">{quickAnswer.result}</span>
            {quickAnswer.detail && <span className="text-xs text-muted">{quickAnswer.detail}</span>}
          </div>
        </FadeIn>
      )}

      {results.length === 0 ? (
        <EmptyState icon="SearchX" title="No tools match your search" />
      ) : (
        <StaggerContainer className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {results.map(({ tool }) => (
            <StaggerItem key={tool.id}>
              <ToolCard
                tool={tool}
                favorited={favoriteIds.has(tool.id)}
                onFavoriteChange={() => setFavoriteIds(new Set(getFavorites().map((f) => f.toolId)))}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}

      {query.trim() && <WebResults query={query} />}
    </div>
  );
}
