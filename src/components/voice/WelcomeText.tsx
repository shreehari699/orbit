"use client";

import { AnimatePresence, motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Always renders the current sentence as real text — screen readers and
 * users with speech disabled see exactly what ORBIT would otherwise say.
 * `aria-live` announces sentence changes for assistive tech.
 */
export function WelcomeText({ sentence }: { sentence: string }) {
  return (
    <div className="relative min-h-[3.5em] w-[min(28rem,86vw)] px-2 text-center" aria-live="polite">
      <AnimatePresence>
        <motion.p
          key={sentence}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.32, ease: EASE }}
          className="absolute inset-x-0 top-0 text-balance text-lg font-medium leading-snug text-foreground sm:text-xl"
        >
          {sentence}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
