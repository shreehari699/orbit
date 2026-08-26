import Link from "next/link";
import * as Icons from "lucide-react";

import { TOOLS, TOOL_CATEGORIES } from "@/registry/tools";
import { Card } from "@/components/ui/Card";

const CATEGORY_ICONS: Record<string, string> = {
  text: "Type",
  ai: "Sparkles",
  convert: "Calculator",
  data: "Database",
  image: "Image",
  document: "FileText",
  file: "Folder",
};

export function ToolsIndexView() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10 lg:px-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tools</h1>
        <p className="mt-1 text-sm text-muted">Browse every ORBIT tool by category.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {TOOL_CATEGORIES.map((category) => {
          const count = TOOLS.filter((t) => t.category === category.id).length;
          const Icon = (Icons[CATEGORY_ICONS[category.id] as keyof typeof Icons] ??
            Icons.Boxes) as Icons.LucideIcon;
          return (
            <Link key={category.id} href={`/tools/category/${category.id}`}>
              <Card className="flex items-center gap-4 p-5 transition hover:border-accent/40 hover:shadow-md">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-sm font-medium">{category.label}</p>
                  <p className="text-xs text-muted">
                    {count} tool{count === 1 ? "" : "s"}
                  </p>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
