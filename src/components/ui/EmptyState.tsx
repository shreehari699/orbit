import type { ReactNode } from "react";
import * as Icons from "lucide-react";

export function EmptyState({
  icon = "Inbox",
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  const Icon = (Icons[icon as keyof typeof Icons] ?? Icons.Inbox) as Icons.LucideIcon;
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border px-6 py-16 text-center">
      <Icon className="h-8 w-8 text-muted" strokeWidth={1.5} />
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
