"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Icons from "lucide-react";

import { NAV_ITEMS, NAV_GROUPS, type NavItem } from "@/constants/navigation";
import { OrbitMark, OrbitWordmark } from "@/components/brand/Logo";
import { useSidebarCollapsed } from "@/lib/ui/useSidebarCollapsed";

function NavLink({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const Icon = (Icons[item.icon as keyof typeof Icons] ?? Icons.Circle) as Icons.LucideIcon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      aria-current={active ? "page" : undefined}
      className={[
        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
        collapsed ? "justify-center" : "",
        active
          ? "bg-foreground text-background"
          : "text-muted hover:bg-black/[0.04] hover:text-foreground dark:hover:bg-white/[0.06]",
      ].join(" ")}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
      {collapsed && <span className="sr-only">{item.label}</span>}
    </Link>
  );
}

export function SidebarContent({
  onNavigate,
  collapsed = false,
}: {
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  const pathname = usePathname();

  return (
    <>
      <div className={`flex h-16 items-center px-5 ${collapsed ? "justify-center px-0" : "gap-2.5"}`}>
        <Link href="/command" onClick={onNavigate} aria-label="ORBIT home">
          {collapsed ? <OrbitMark className="h-7 w-7" /> : <OrbitWordmark markClassName="h-7 w-7" />}
        </Link>
      </div>

      <nav aria-label="Primary" className="orbit-scrollbar flex-1 space-y-6 overflow-y-auto px-3 py-2">
        {NAV_GROUPS.map((group) => {
          const items = NAV_ITEMS.filter((i) => i.group === group.key);
          return (
            <div key={group.key}>
              {!collapsed && (
                <div className="mb-1.5 px-3 text-[11px] font-medium uppercase tracking-wider text-muted">
                  {group.label}
                </div>
              )}
              <div className="space-y-0.5">
                {items.map((item) => (
                  <NavLink
                    key={item.href}
                    item={item}
                    active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                    collapsed={collapsed}
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
  const { collapsed, toggle } = useSidebarCollapsed();

  return (
    <aside
      className={`hidden h-full shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-200 motion-reduce:transition-none lg:flex ${
        collapsed ? "w-[68px]" : "w-64"
      }`}
    >
      <SidebarContent collapsed={collapsed} />
      <div className="border-t border-border p-2">
        <button
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-pressed={collapsed}
          className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-black/[0.04] hover:text-foreground dark:hover:bg-white/[0.06] ${
            collapsed ? "justify-center" : ""
          }`}
        >
          {collapsed ? (
            <Icons.PanelLeftOpen className="h-[18px] w-[18px]" strokeWidth={1.75} />
          ) : (
            <>
              <Icons.PanelLeftClose className="h-[18px] w-[18px]" strokeWidth={1.75} />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
