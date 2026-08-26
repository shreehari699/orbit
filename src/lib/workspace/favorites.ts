"use client";

import { readLocal, writeLocal } from "@/lib/storage/local-store";
import type { FavoriteEntry } from "./types";

const KEY = "orbit.workspace.favorites.v1";

export function getFavorites(): FavoriteEntry[] {
  return readLocal<FavoriteEntry[]>(KEY, []);
}

export function isFavorite(toolId: string): boolean {
  return getFavorites().some((f) => f.toolId === toolId);
}

export function toggleFavorite(
  entry: Omit<FavoriteEntry, "addedAt">,
): FavoriteEntry[] {
  const current = getFavorites();
  const exists = current.some((f) => f.toolId === entry.toolId);
  const next = exists
    ? current.filter((f) => f.toolId !== entry.toolId)
    : [{ ...entry, addedAt: new Date().toISOString() }, ...current];
  writeLocal(KEY, next);
  return next;
}
