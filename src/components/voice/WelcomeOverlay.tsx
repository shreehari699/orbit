"use client";

import { motion } from "framer-motion";
import * as Icons from "lucide-react";

import { OrbitCore, type OrbitCoreState } from "@/components/motion/OrbitCore";
import { WelcomeText } from "./WelcomeText";

const EASE = [0.16, 1, 0.3, 1] as const;

export function WelcomeOverlay({
  coreState,
  sentence,
  blocked,
  showMute,
  onSkip,
  onMute,
  onEnableVoice,
  onNotNow,
}: {
  coreState: OrbitCoreState;
  sentence: string;
  blocked: boolean;
  showMute: boolean;
  onSkip: () => void;
  onMute: () => void;
  onEnableVoice: () => void;
  onNotNow: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.35, ease: EASE } }}
      transition={{ duration: 0.4, ease: EASE }}
    >
      <button
        aria-label="Skip welcome and open ORBIT"
        className="absolute inset-0 bg-background/85 backdrop-blur-xl"
        onClick={onSkip}
      />

      <button
        aria-label="Close welcome"
        onClick={onSkip}
        className="orbit-focus absolute right-5 top-5 rounded-control p-2 text-muted transition-colors hover:bg-black/[0.04] hover:text-foreground dark:hover:bg-white/[0.06]"
      >
        <Icons.X className="h-5 w-5" strokeWidth={1.75} />
      </button>

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="ORBIT welcome"
        className="relative flex flex-col items-center gap-6 text-center"
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.3, ease: EASE } }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <div className="h-28 w-28 sm:h-36 sm:w-36">
          <OrbitCore state={coreState} />
        </div>

        {blocked ? (
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-muted">🔊 ORBIT Voice — Enable spoken welcome</p>
            <div className="flex items-center gap-2">
              <button
                onClick={onEnableVoice}
                className="orbit-focus rounded-control bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
              >
                Enable
              </button>
              <button
                onClick={onNotNow}
                className="orbit-focus rounded-control px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
              >
                Not now
              </button>
            </div>
          </div>
        ) : (
          <WelcomeText sentence={sentence} />
        )}

        <div className="flex items-center gap-4 text-xs text-muted">
          {showMute && (
            <button
              onClick={onMute}
              className="orbit-focus rounded-control px-2 py-1 transition-colors hover:text-foreground"
            >
              Mute
            </button>
          )}
          {!blocked && (
            <button
              onClick={onSkip}
              className="orbit-focus rounded-control px-2 py-1 transition-colors hover:text-foreground"
            >
              Skip
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
