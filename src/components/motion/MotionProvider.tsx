"use client";

import { MotionConfig } from "framer-motion";

/**
 * `reducedMotion="user"` makes every Framer Motion animation in ORBIT
 * respect the OS-level reduced-motion preference automatically —
 * satisfies the accessibility requirement application-wide instead of
 * every component re-checking `prefers-reduced-motion` itself.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
