"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";

import type { ToolDef } from "@/registry/tools";
import { toggleFavorite } from "@/lib/workspace/favorites";
import { recordVisit } from "@/lib/workspace/history";

const EASE = [0.16, 1, 0.3, 1] as const;

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
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.18, ease: EASE } }}
      whileTap={{ scale: 0.99 }}
      className="group rounded-card border border-border bg-surface shadow-[var(--shadow-card)] transition-colors duration-150 hover:border-accent/40 hover:shadow-[var(--shadow-raised)]"
    >
      <Link
        href={tool.href}
        onClick={() => recordVisit({ toolId: tool.id, label: tool.label, href: tool.href })}
        className="orbit-focus flex flex-col gap-3 rounded-card p-4"
      >
        <div className="flex items-start justify-between">
          <div className="grid h-10 w-10 place-items-center rounded-control bg-accent/10 text-accent">
            <Icon className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <button
            aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
            onClick={handleFavorite}
            className="orbit-focus rounded-control p-1.5 text-muted transition-colors hover:bg-black/[0.04] hover:text-accent dark:hover:bg-white/[0.06]"
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
    </motion.div>
  );
}
