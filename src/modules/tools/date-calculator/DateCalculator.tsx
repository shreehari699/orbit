"use client";

import { useMemo, useState } from "react";

import { getToolById } from "@/registry/tools";
import { addDays, calendarDiff } from "@/lib/date/diff";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";

const tool = getToolById("date-calculator")!;
const today = new Date().toISOString().slice(0, 10);

export function DateCalculator() {
  const [dateA, setDateA] = useState(today);
  const [dateB, setDateB] = useState(today);

  const diff = useMemo(() => {
    const a = new Date(dateA);
    const b = new Date(dateB);
    if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return null;
    return calendarDiff(a, b);
  }, [dateA, dateB]);

  const [baseDate, setBaseDate] = useState(today);
  const [offsetDays, setOffsetDays] = useState("30");

  const shifted = useMemo(() => {
    const base = new Date(baseDate);
    const offset = Number(offsetDays);
    if (Number.isNaN(base.getTime()) || Number.isNaN(offset)) return null;
    return addDays(base, offset);
  }, [baseDate, offsetDays]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 lg:px-8">
      <ToolHeader tool={tool} />

      <Card className="flex flex-col gap-4 p-5">
        <p className="text-sm font-medium">Days between two dates</p>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="date"
            value={dateA}
            onChange={(e) => setDateA(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent/50"
          />
          <input
            type="date"
            value={dateB}
            onChange={(e) => setDateB(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent/50"
          />
        </div>
        {diff && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Total days" value={diff.totalDays} />
            <StatCard label="Years" value={diff.years} />
            <StatCard label="Months" value={diff.months} />
            <StatCard label="Days" value={diff.days} />
          </div>
        )}
      </Card>

      <Card className="flex flex-col gap-4 p-5">
        <p className="text-sm font-medium">Add or subtract days from a date</p>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="date"
            value={baseDate}
            onChange={(e) => setBaseDate(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent/50"
          />
          <input
            value={offsetDays}
            onChange={(e) => setOffsetDays(e.target.value)}
            inputMode="numeric"
            placeholder="Days (negative to subtract)"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent/50"
          />
        </div>
        <p className="text-sm text-muted">
          Result:{" "}
          <span className="font-semibold text-foreground">
            {shifted
              ? shifted.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
              : "—"}
          </span>
        </p>
      </Card>
    </div>
  );
}
