"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Icons from "lucide-react";

import { NAV_ITEMS, NAV_GROUPS, type NavItem } from "@/constants/navigation";
import { OrbitWordmark } from "@/components/brand/Logo";

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
}) {
  const Icon = (Icons[item.icon as keyof typeof Icons] ?? Icons.Circle) as Icons.LucideIcon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={[
        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
        active
          ? "bg-foreground text-background"
          : "text-muted hover:bg-black/[0.04] hover:text-foreground dark:hover:bg-white/[0.06]",
      ].join(" ")}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
      <span className="flex-1 truncate">{item.label}</span>
    </Link>
  );
}

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <div className="flex h-16 items-center gap-2.5 px-5">
        <Link href="/command" onClick={onNavigate}>
          <OrbitWordmark markClassName="h-7 w-7" />
        </Link>
      </div>

      <nav className="orbit-scrollbar flex-1 space-y-6 overflow-y-auto px-3 py-2">
        {NAV_GROUPS.map((group) => {
          const items = NAV_ITEMS.filter((i) => i.group === group.key);
          return (
            <div key={group.key}>
              <div className="mb-1.5 px-3 text-[11px] font-medium uppercase tracking-wider text-muted">
                {group.label}
              </div>
              <div className="space-y-0.5">
                {items.map((item) => (
                  <NavLink
                    key={item.href}
                    item={item}
                    active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </nav>
    </>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-border bg-surface lg:flex">
      <SidebarContent />
    </aside>
  );
}
