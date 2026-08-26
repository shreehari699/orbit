"use client";

import { useMemo, useState } from "react";

import { getToolById } from "@/registry/tools";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { Card } from "@/components/ui/Card";

const tool = getToolById("percentage-calculator")!;

function fmt(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return (Math.round(n * 1e4) / 1e4).toLocaleString();
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-xs font-medium uppercase tracking-wide text-muted">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode="decimal"
        className="rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-accent/50"
      />
    </label>
  );
}

export function PercentageCalculator() {
  const [x1, setX1] = useState("15");
  const [y1, setY1] = useState("200");

  const [x2, setX2] = useState("50");
  const [y2, setY2] = useState("200");

  const [from, setFrom] = useState("80");
  const [to, setTo] = useState("100");

  const ofResult = useMemo(() => (Number(x1) / 100) * Number(y1), [x1, y1]);
  const whatPercentResult = useMemo(() => (Number(x2) / Number(y2)) * 100, [x2, y2]);
  const changeResult = useMemo(() => ((Number(to) - Number(from)) / Number(from)) * 100, [from, to]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 lg:px-8">
      <ToolHeader tool={tool} />

      <Card className="flex flex-col gap-4 p-5">
        <p className="text-sm font-medium">What is X% of Y?</p>
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="X (%)" value={x1} onChange={setX1} />
          <NumberField label="Y" value={y1} onChange={setY1} />
        </div>
        <p className="text-sm text-muted">
          Result: <span className="font-semibold text-foreground">{fmt(ofResult)}</span>
        </p>
      </Card>

      <Card className="flex flex-col gap-4 p-5">
        <p className="text-sm font-medium">X is what percent of Y?</p>
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="X" value={x2} onChange={setX2} />
          <NumberField label="Y" value={y2} onChange={setY2} />
        </div>
        <p className="text-sm text-muted">
          Result: <span className="font-semibold text-foreground">{fmt(whatPercentResult)}%</span>
        </p>
      </Card>

      <Card className="flex flex-col gap-4 p-5">
        <p className="text-sm font-medium">Percentage change from X to Y</p>
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="From" value={from} onChange={setFrom} />
          <NumberField label="To" value={to} onChange={setTo} />
        </div>
        <p className="text-sm text-muted">
          Change:{" "}
          <span className="font-semibold text-foreground">
            {changeResult > 0 ? "+" : ""}
            {fmt(changeResult)}%
          </span>
        </p>
      </Card>
    </div>
  );
}
