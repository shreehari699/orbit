"use client";

import Link from "next/link";
import * as Icons from "lucide-react";

import type { ToolDef } from "@/registry/tools";
import { toggleFavorite } from "@/lib/workspace/favorites";
import { recordVisit } from "@/lib/workspace/history";

export function ToolCard({
  tool,
  favorited,
  onFavoriteChange,
  meta,
}: {
  tool: ToolDef;
  favorited: boolean;
  onFavoriteChange?: (favorited: boolean) => void;
  meta?: string;
}) {
  const Icon = (Icons[tool.icon as keyof typeof Icons] ?? Icons.Circle) as Icons.LucideIcon;

  function handleFavorite(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    const next = toggleFavorite({ toolId: tool.id, label: tool.label, href: tool.href });
    onFavoriteChange?.(next.some((f) => f.toolId === tool.id));
  }

  return (
    <Link
      href={tool.href}
      onClick={() => recordVisit({ toolId: tool.id, label: tool.label, href: tool.href })}
      className="group flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 transition hover:border-accent/40 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <button
          aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
          onClick={handleFavorite}
          className="rounded-lg p-1.5 text-muted transition hover:bg-black/[0.04] hover:text-accent dark:hover:bg-white/[0.06]"
        >
          <Icons.Star
            className="h-4 w-4"
            strokeWidth={1.75}
            fill={favorited ? "currentColor" : "none"}
            color={favorited ? "var(--accent)" : "currentColor"}
          />
        </button>
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{tool.label}</p>
        <p className="mt-0.5 text-xs text-muted">{meta ?? tool.description}</p>
      </div>
    </Link>
  );
}
