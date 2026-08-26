import Link from "next/link";
import * as Icons from "lucide-react";

import type { ZeroDegreeApp } from "@/registry/apps";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function AppCard({ app }: { app: ZeroDegreeApp }) {
  const connected = Boolean(app.url);

  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold">{app.name}</p>
          <p className="mt-0.5 text-xs text-muted">{app.tagline}</p>
        </div>
        <Badge tone={connected ? "success" : "neutral"}>
          {connected ? "Connected" : "Not connected"}
        </Badge>
      </div>

      {connected ? (
        <Link
          href={app.url!}
          target={app.self ? undefined : "_blank"}
          rel={app.self ? undefined : "noopener noreferrer"}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
        >
          Open {app.name}
          <Icons.ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
        </Link>
      ) : (
        <p className="text-xs text-muted">
          Set <code className="rounded bg-black/[0.05] px-1 dark:bg-white/[0.08]">
            NEXT_PUBLIC_{app.id.toUpperCase()}_URL
          </code>{" "}
          to connect this app.
        </p>
      )}
    </Card>
  );
}
