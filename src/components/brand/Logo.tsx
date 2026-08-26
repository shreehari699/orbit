/**
 * ORBIT mark — three eccentric rings around a core, echoing the product
 * name. Pure SVG (no external asset), so it renders identically in light
 * and dark and needs no network fetch.
 */
export function OrbitMark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="orbit-mark-grad" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="var(--accent)" />
          <stop offset="100%" stopColor="var(--accent-2)" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="3.4" fill="url(#orbit-mark-grad)" />
      <ellipse
        cx="16"
        cy="16"
        rx="14"
        ry="6"
        stroke="url(#orbit-mark-grad)"
        strokeWidth="1.6"
        opacity="0.9"
      />
      <ellipse
        cx="16"
        cy="16"
        rx="14"
        ry="6"
        stroke="url(#orbit-mark-grad)"
        strokeWidth="1.6"
        opacity="0.55"
        transform="rotate(60 16 16)"
      />
      <ellipse
        cx="16"
        cy="16"
        rx="14"
        ry="6"
        stroke="url(#orbit-mark-grad)"
        strokeWidth="1.6"
        opacity="0.55"
        transform="rotate(120 16 16)"
      />
    </svg>
  );
}

export function OrbitWordmark({
  className = "",
  markClassName = "h-6 w-6",
}: {
  className?: string;
  markClassName?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <OrbitMark className={markClassName} />
      <span className="text-base font-semibold tracking-tight">
        <span className="orbit-gradient-text">ORBIT</span>
      </span>
    </span>
  );
}
