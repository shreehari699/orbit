"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import * as Icons from "lucide-react";

import { SidebarContent } from "./Sidebar";
import { usePalette } from "@/components/command/palette-context";
import { OrbitWordmark } from "@/components/brand/Logo";

const EASE = [0.16, 1, 0.3, 1] as const;

function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <motion.button
            aria-label="Close menu"
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="orbit-glass relative flex h-full w-72 max-w-[80vw] flex-col border-r border-border"
            initial={{ x: -24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -24, opacity: 0 }}
            transition={{ duration: 0.24, ease: EASE }}
          >
            <SidebarContent onNavigate={onClose} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function Topbar() {
  const { toggle } = usePalette();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="orbit-glass flex h-16 shrink-0 items-center gap-3 border-b border-border px-4 lg:px-6">
        <button
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
          className="orbit-focus rounded-control p-2 text-muted transition-colors hover:bg-black/[0.04] hover:text-foreground dark:hover:bg-white/[0.06] lg:hidden"
        >
          <Icons.Menu className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
        </button>

        <div className="lg:hidden">
          <OrbitWordmark markClassName="h-6 w-6" />
        </div>

        <button
          onClick={toggle}
          aria-label="Search ORBIT (Cmd+K)"
          className="orbit-focus ml-auto flex w-full max-w-sm items-center gap-2 rounded-control border border-border bg-background/60 px-3 py-2 text-left text-sm text-muted transition-colors hover:border-accent/40 hover:text-foreground"
        >
          <Icons.Search className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
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
