"use client";

import { useState } from "react";
import * as Icons from "lucide-react";

import { SidebarContent } from "./Sidebar";
import { usePalette } from "@/components/command/palette-context";
import { OrbitWordmark } from "@/components/brand/Logo";

function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <button aria-label="Close menu" className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative flex h-full w-72 max-w-[80vw] flex-col border-r border-border bg-surface">
        <SidebarContent onNavigate={onClose} />
      </div>
    </div>
  );
}

export function Topbar() {
  const { toggle } = usePalette();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-surface px-4 lg:px-6">
        <button
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-muted hover:bg-black/[0.04] hover:text-foreground dark:hover:bg-white/[0.06] lg:hidden"
        >
          <Icons.Menu className="h-5 w-5" strokeWidth={1.75} />
        </button>

        <div className="lg:hidden">
          <OrbitWordmark markClassName="h-6 w-6" />
        </div>

        <button
          onClick={toggle}
          className="ml-auto flex w-full max-w-sm items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-left text-sm text-muted transition hover:border-accent/40"
        >
          <Icons.Search className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          <span className="flex-1 truncate">Search ORBIT…</span>
          <kbd className="hidden shrink-0 rounded border border-border px-1.5 py-0.5 text-[10px] sm:block">
            ⌘K
          </kbd>
        </button>
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
