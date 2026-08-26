"use client";

import { motion, type HTMLMotionProps, type Variants } from "framer-motion";

/**
 * ORBIT's motion vocabulary — every animated surface in the app composes
 * from these instead of hand-rolling transition props inline. Timings
 * follow one scale: micro-interactions ~150-220ms, component transitions
 * ~250-400ms. `MotionConfig reducedMotion="user"` in the root layout
 * already disables all of this for users with reduced-motion set, so
 * nothing here needs its own `prefers-reduced-motion` check.
 */

const EASE = [0.16, 1, 0.3, 1] as const; // a fast-out, gentle-settle curve — no bounce, no overshoot

export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease: EASE } },
  exit: { opacity: 0, transition: { duration: 0.15, ease: EASE } },
};

export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.97, y: -4 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.22, ease: EASE } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.15, ease: EASE } },
};

export const slideInVariants: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.24, ease: EASE } },
  exit: { opacity: 0, x: -16, transition: { duration: 0.18, ease: EASE } },
};

export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.035, delayChildren: 0.02 } },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: EASE } },
};

export function FadeIn(props: HTMLMotionProps<"div">) {
  return <motion.div variants={fadeVariants} initial="hidden" animate="visible" exit="exit" {...props} />;
}

export function ScaleIn(props: HTMLMotionProps<"div">) {
  return <motion.div variants={scaleInVariants} initial="hidden" animate="visible" exit="exit" {...props} />;
}

export function SlideIn(props: HTMLMotionProps<"div">) {
  return <motion.div variants={slideInVariants} initial="hidden" animate="visible" exit="exit" {...props} />;
}

export function StaggerContainer(props: HTMLMotionProps<"div">) {
  return <motion.div variants={staggerContainerVariants} initial="hidden" animate="visible" {...props} />;
}

export function StaggerItem(props: HTMLMotionProps<"div">) {
  return <motion.div variants={staggerItemVariants} {...props} />;
}

/** A card that lifts subtly on hover — 2px, a soft shadow, nothing more. Used for tool cards and other clickable modules. */
export function MotionCard(props: HTMLMotionProps<"div">) {
  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.18, ease: EASE } }}
      whileTap={{ scale: 0.99 }}
      {...props}
    />
  );
}
