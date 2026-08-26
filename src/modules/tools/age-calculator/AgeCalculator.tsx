"use client";

import { useMemo, useState } from "react";

import { getToolById } from "@/registry/tools";
import { calendarDiff } from "@/lib/date/diff";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";

const tool = getToolById("age-calculator")!;
const today = new Date().toISOString().slice(0, 10);

export function AgeCalculator() {
  const [birthDate, setBirthDate] = useState("");

  const result = useMemo(() => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    if (Number.isNaN(birth.getTime())) return null;
    if (birth > new Date()) return null;
    return calendarDiff(birth, new Date());
  }, [birthDate]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10 lg:px-8">
      <ToolHeader tool={tool} />

      <Card className="flex flex-col gap-4 p-5">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs font-medium uppercase tracking-wide text-muted">Date of birth</span>
          <input
            type="date"
            value={birthDate}
            max={today}
            onChange={(e) => setBirthDate(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent/50"
          />
        </label>
      </Card>

      {result && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Years" value={result.years} />
          <StatCard label="Months" value={result.months} />
          <StatCard label="Days" value={result.days} />
          <StatCard label="Total days lived" value={result.totalDays.toLocaleString()} />
        </div>
      )}
    </div>
  );
}
