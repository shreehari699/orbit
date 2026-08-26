"use client";

import { useMemo, useState } from "react";
import * as Icons from "lucide-react";

import { getToolById } from "@/registry/tools";
import {
  UNIT_CATEGORIES,
  convert,
  convertTemperature,
  type TemperatureUnit,
} from "@/lib/units/convert";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const tool = getToolById("unit-converter")!;

const TEMPERATURE_UNITS: { id: TemperatureUnit; label: string }[] = [
  { id: "c", label: "Celsius" },
  { id: "f", label: "Fahrenheit" },
  { id: "k", label: "Kelvin" },
];

type CategoryId = (typeof UNIT_CATEGORIES)[number]["id"] | "temperature";

function formatResult(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return (Math.round(n * 1e6) / 1e6).toLocaleString(undefined, { maximumFractionDigits: 6 });
}

export function UnitConverter() {
  const [categoryId, setCategoryId] = useState<CategoryId>("length");
  const [value, setValue] = useState("1");
  const category = UNIT_CATEGORIES.find((c) => c.id === categoryId);

  const [fromId, setFromId] = useState(category?.units[0]?.id ?? "c");
  const [toId, setToId] = useState(category?.units[1]?.id ?? "f");

  function selectCategory(next: CategoryId) {
    setCategoryId(next);
    if (next === "temperature") {
      setFromId("c");
      setToId("f");
    } else {
      const cat = UNIT_CATEGORIES.find((c) => c.id === next)!;
      setFromId(cat.units[0]!.id);
      setToId(cat.units[1]!.id);
    }
  }

  const numericValue = Number(value);
  const result = useMemo(() => {
    if (!Number.isFinite(numericValue)) return null;
    if (categoryId === "temperature") {
      return convertTemperature(numericValue, fromId as TemperatureUnit, toId as TemperatureUnit);
    }
    if (!category) return null;
    return convert(category, numericValue, fromId, toId);
  }, [numericValue, categoryId, category, fromId, toId]);

  const unitOptions =
    categoryId === "temperature" ? TEMPERATURE_UNITS : (category?.units ?? []);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 lg:px-8">
      <ToolHeader tool={tool} />

      <div className="flex flex-wrap gap-2">
        {[...UNIT_CATEGORIES.map((c) => ({ id: c.id as CategoryId, label: c.label })), { id: "temperature" as CategoryId, label: "Temperature" }].map(
          (c) => (
            <button
              key={c.id}
              onClick={() => selectCategory(c.id)}
              className={`rounded-full px-3.5 py-1.5 text-sm transition ${
                categoryId === c.id
                  ? "bg-foreground text-background"
                  : "bg-black/[0.05] text-muted hover:text-foreground dark:bg-white/[0.06]"
              }`}
            >
              {c.label}
            </button>
          ),
        )}
      </div>

      <Card className="flex flex-col gap-4 p-5">
        <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-[1fr_auto_1fr]">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">
              Value
            </label>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              inputMode="decimal"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent/50"
            />
            <select
              value={fromId}
              onChange={(e) => setFromId(e.target.value)}
              className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent/50"
            >
              {unitOptions.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="secondary"
            className="mx-auto sm:mb-9"
            onClick={() => {
              setFromId(toId);
              setToId(fromId);
            }}
            aria-label="Swap units"
          >
            <Icons.ArrowLeftRight className="h-4 w-4" strokeWidth={1.75} />
          </Button>

          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">
              Result
            </label>
            <div className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium tabular-nums">
              {result === null ? "—" : formatResult(result)}
            </div>
            <select
              value={toId}
              onChange={(e) => setToId(e.target.value)}
              className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent/50"
            >
              {unitOptions.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>
    </div>
  );
}
