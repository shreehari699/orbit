import type { Metadata } from "next";
import * as Icons from "lucide-react";

import { getZeroDegreeApps } from "@/registry/apps";
import { AppCard } from "@/components/apps/AppCard";

export const metadata: Metadata = { title: "Zero Degree Apps" };

export default function AppsPage() {
  const apps = getZeroDegreeApps();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10 lg:px-8">
      <div className="flex items-center gap-2">
        <Icons.Grid3x3 className="h-5 w-5 text-accent" strokeWidth={1.75} />
        <h1 className="text-2xl font-semibold tracking-tight">Zero Degree Apps</h1>
      </div>
      <p className="-mt-4 text-sm text-muted">
        Every product in the Zero Degree family. An app shows as connected once its URL is
        configured in ORBIT&apos;s environment.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {apps.map((app) => (
          <AppCard key={app.id} app={app} />
        ))}
      </div>
    </div>
  );
}
