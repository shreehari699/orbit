"use client";

/**
 * SSR-safe localStorage helper. Every read/write is guarded because these
 * run in components rendered on the server first; `window` is undefined
 * there, and a private-browsing tab or blocked storage can throw even on
 * the client, so every access is wrapped rather than assumed to succeed.
 */

export function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeLocal<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable (quota, private mode) — the write is best-effort.
  }
}
