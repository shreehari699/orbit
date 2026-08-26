"use client";

import { useEffect, useState } from "react";
import * as Icons from "lucide-react";

import type { ToolDef } from "@/registry/tools";
import { isFavorite, toggleFavorite } from "@/lib/workspace/favorites";
import { recordVisit } from "@/lib/workspace/history";

export function ToolHeader({ tool }: { tool: ToolDef }) {
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    setFavorited(isFavorite(tool.id));
    recordVisit({ toolId: tool.id, label: tool.label, href: tool.href });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool.id]);

  const Icon = (Icons[tool.icon as keyof typeof Icons] ?? Icons.Circle) as Icons.LucideIcon;

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-control bg-accent/10 text-accent">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{tool.label}</h1>
          <p className="mt-0.5 text-sm text-muted">{tool.description}</p>
        </div>
      </div>
      <button
        aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
        onClick={() => {
          const next = toggleFavorite({ toolId: tool.id, label: tool.label, href: tool.href });
          setFavorited(next.some((f) => f.toolId === tool.id));
        }}
        className="orbit-focus shrink-0 rounded-control p-2 text-muted transition-colors hover:bg-black/[0.04] hover:text-accent dark:hover:bg-white/[0.06]"
      >
        <Icons.Star
          className="h-5 w-5"
          strokeWidth={1.75}
          fill={favorited ? "currentColor" : "none"}
          color={favorited ? "var(--accent)" : "currentColor"}
        />
      </button>
    </div>
  );
}
