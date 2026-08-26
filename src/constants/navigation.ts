export interface NavItem {
  label: string;
  href: string;
  icon: string; // lucide-react icon name
  group: "main" | "connect";
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Command Center", href: "/command", icon: "LayoutGrid", group: "main" },
  { label: "Search", href: "/search", icon: "Search", group: "main" },
  { label: "Tools", href: "/tools", icon: "Boxes", group: "main" },
  { label: "Favorites", href: "/favorites", icon: "Star", group: "main" },
  { label: "History", href: "/history", icon: "History", group: "main" },

  { label: "Zero Degree Apps", href: "/apps", icon: "Grid3x3", group: "connect" },
  { label: "LOOP", href: "/integrations/loop", icon: "Repeat", group: "connect" },
  { label: "CIVI", href: "/integrations/civi", icon: "Landmark", group: "connect" },
];

export const NAV_GROUPS: { key: NavItem["group"]; label: string }[] = [
  { key: "main", label: "ORBIT" },
  { key: "connect", label: "Connect" },
];
