/**
 * Next.js remounts `template.tsx` on every navigation (unlike layout.tsx,
 * which persists) — the standard, dependency-free way to get a per-page
 * transition without a client-side animation library. The fade is a plain
 * CSS keyframe guarded by `prefers-reduced-motion` in globals.css.
 */
export default function AppTemplate({ children }: { children: React.ReactNode }) {
  return <div className="orbit-fade-in">{children}</div>;
}
