"use client";

import { motion } from "framer-motion";

/**
 * ORBIT's signature ambient visual — a small orbital ring system around a
 * breathing core, used both as a subtle brand touch (idle, low-opacity,
 * decorative) and as the visual centerpiece of the Voice Welcome overlay
 * (state-driven). Everything here is CSS/Framer Motion — no audio analysis
 * is performed, so the "waveform" is an honest ambient decoration tied to
 * `state`, never a fabricated visualization of real audio data.
 *
 * Reduced motion: the spin/breathe CSS keyframes are scoped inside
 * `@media (prefers-reduced-motion: no-preference)` in globals.css, and the
 * Framer Motion pieces inherit `MotionConfig reducedMotion="user"` from the
 * root layout — so this component needs no reduced-motion logic of its own.
 */

export type OrbitCoreState = "idle" | "intro" | "speaking" | "complete";

const EASE = [0.16, 1, 0.3, 1] as const;

const CORE_SCALE: Record<OrbitCoreState, number> = {
  idle: 1,
  intro: 1.05,
  speaking: 1.08,
  complete: 1,
};

const GLOW_OPACITY: Record<OrbitCoreState, number> = {
  idle: 0.3,
  intro: 0.5,
  speaking: 0.7,
  complete: 0.35,
};

// One gentle height sequence per bar, offset so the group reads as an
// organic ambient pulse rather than a synchronized blink.
const WAVE_SEQUENCES: number[][] = [
  [3, 8, 4, 3],
  [3, 11, 5, 3],
  [3, 6, 13, 3],
  [3, 10, 4, 3],
  [3, 7, 3, 3],
];

export function OrbitCore({
  state = "idle",
  size = 120,
  className = "",
}: {
  state?: OrbitCoreState;
  size?: number;
  className?: string;
}) {
  const speaking = state === "speaking";

  return (
    <div
      className={`relative grid place-items-center ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <motion.div
        className="orbit-core-glow absolute inset-0 rounded-full blur-2xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--accent) 55%, transparent) 0%, transparent 70%)",
        }}
        animate={{ opacity: GLOW_OPACITY[state] }}
        transition={{ duration: 0.5, ease: EASE }}
      />

      <div className="orbit-core-ring absolute inset-[8%] rounded-full border border-accent/30" />
      <div
        className="orbit-core-ring absolute inset-[18%] rounded-full border border-accent-2/20"
        style={{ animationDirection: "reverse", animationDuration: "26s" }}
      />

      {/* Subtle orbiting particle, riding the outer ring's rotation */}
      <div className="orbit-core-ring absolute inset-[8%]" style={{ animationDuration: "18s" }}>
        <span className="absolute left-1/2 top-0 h-1 w-1 -translate-x-1/2 rounded-full bg-accent-2/70" />
      </div>

      <motion.div
        className="relative grid h-[34%] w-[34%] place-items-center rounded-full"
        style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }}
        animate={{ scale: CORE_SCALE[state] }}
        transition={{
          duration: 0.6,
          ease: EASE,
          repeat: speaking ? Infinity : 0,
          repeatType: "mirror",
        }}
      >
        <div className="flex items-end gap-[3px]">
          {WAVE_SEQUENCES.map((sequence, i) => (
            <motion.span
              key={i}
              className="w-[2px] rounded-full bg-accent-foreground/80"
              animate={{ height: speaking ? sequence : sequence[0] }}
              transition={{
                duration: 0.7,
                repeat: speaking ? Infinity : 0,
                repeatType: "mirror",
                delay: i * 0.09,
                ease: EASE,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
