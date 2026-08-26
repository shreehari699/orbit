import Link from "next/link";
import * as Icons from "lucide-react";

import { getZeroDegreeApps } from "@/registry/apps";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function IntegrationPage({
  appId,
  icon,
  description,
}: {
  appId: string;
  icon: string;
  description: string;
}) {
  const app = getZeroDegreeApps().find((a) => a.id === appId);
  if (!app) return null;

  const Icon = (Icons[icon as keyof typeof Icons] ?? Icons.Link2) as Icons.LucideIcon;
  const connected = Boolean(app.url);
  const envVar = `NEXT_PUBLIC_${appId.toUpperCase()}_URL`;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 lg:px-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
            <Icon className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{app.name}</h1>
            <p className="mt-0.5 text-sm text-muted">{description}</p>
          </div>
        </div>
        <Badge tone={connected ? "success" : "neutral"}>{connected ? "Connected" : "Not connected"}</Badge>
      </div>

      <Card className="p-5">
        {connected ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm">
              {app.name} is configured at <code className="rounded bg-black/[0.05] px-1 dark:bg-white/[0.08]">{app.url}</code>.
            </p>
            <Link
              href={app.url!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground transition hover:opacity-90"
            >
              Open {app.name}
              <Icons.ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted">
              {app.name} isn&apos;t connected yet. Set <code className="rounded bg-black/[0.05] px-1 dark:bg-white/[0.08]">{envVar}</code>{" "}
              in your environment to the deployed {app.name} URL, then redeploy ORBIT — the link
              above will activate automatically. No connection is fabricated in the meantime.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
