import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-foreground shadow-[var(--shadow-card)] hover:opacity-90 disabled:opacity-50",
  secondary:
    "bg-black/[0.05] text-foreground hover:bg-black/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.1]",
  ghost: "text-muted hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06]",
};

export function Button({
  variant = "secondary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`orbit-focus inline-flex items-center justify-center gap-1.5 rounded-control px-3 py-1.5 text-sm font-medium transition-colors duration-150 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
