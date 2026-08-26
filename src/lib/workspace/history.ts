"use client";

import { readLocal, writeLocal } from "@/lib/storage/local-store";
import type { HistoryEntry } from "./types";

const KEY = "orbit.workspace.history.v1";
const MAX_ENTRIES = 50;

export function getHistory(): HistoryEntry[] {
  return readLocal<HistoryEntry[]>(KEY, []);
}

/**
 * Records a visit. Deduplicates by tool — a repeat visit moves the entry
 * to the top with a fresh timestamp rather than piling up duplicates.
 */
export function recordVisit(entry: Omit<HistoryEntry, "at">): HistoryEntry[] {
  const existing = getHistory().filter((e) => e.toolId !== entry.toolId);
  const next = [{ ...entry, at: new Date().toISOString() }, ...existing].slice(
    0,
    MAX_ENTRIES,
  );
  writeLocal(KEY, next);
  return next;
}

export function clearHistory(): HistoryEntry[] {
  writeLocal(KEY, []);
  return [];
}
