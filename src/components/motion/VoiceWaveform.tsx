"use client";

import { motion } from "framer-motion";

/**
 * A small ambient bar waveform tied to `active` (true while ORBIT is
 * speaking). This is a decorative state indicator, not a visualization of
 * real audio amplitude — no audio analysis is performed, so nothing here
 * is fabricated from invented data.
 */

const EASE = [0.16, 1, 0.3, 1] as const;

// One gentle height sequence per bar, offset so the group reads as an
// organic pulse rather than a synchronized blink.
const WAVE_SEQUENCES: number[][] = [
  [3, 8, 4, 3],
  [3, 11, 5, 3],
  [3, 6, 13, 3],
  [3, 10, 4, 3],
  [3, 7, 3, 3],
];

export function VoiceWaveform({ active = false, className = "" }: { active?: boolean; className?: string }) {
  return (
    <div className={`flex items-end gap-[3px] ${className}`} aria-hidden="true">
      {WAVE_SEQUENCES.map((sequence, i) => (
        <motion.span
          key={i}
          className="w-[2px] rounded-full bg-accent-foreground/80"
          animate={{ height: active ? sequence : sequence[0] }}
          transition={{
            duration: 0.7,
            repeat: active ? Infinity : 0,
            repeatType: "mirror",
            delay: i * 0.09,
            ease: EASE,
          }}
        />
      ))}
    </div>
  );
}
