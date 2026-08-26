"use client";

import { useEffect, useMemo, useState } from "react";
import * as Icons from "lucide-react";

import { getToolById } from "@/registry/tools";
import {
  estimateEntropyBits,
  generatePassword,
  strengthLabel,
  type PasswordOptions,
} from "@/lib/security/password";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { Badge } from "@/components/ui/Badge";

const tool = getToolById("password-generator")!;

const TOGGLES: { key: keyof Omit<PasswordOptions, "length">; label: string }[] = [
  { key: "uppercase", label: "Uppercase (A-Z)" },
  { key: "lowercase", label: "Lowercase (a-z)" },
  { key: "numbers", label: "Numbers (0-9)" },
  { key: "symbols", label: "Symbols (!@#$…)" },
];

export function PasswordGenerator() {
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const [password, setPassword] = useState("");

  function regenerate(next: PasswordOptions = options) {
    setPassword(generatePassword(next));
  }

  useEffect(() => {
    regenerate(options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bits = useMemo(() => estimateEntropyBits(options), [options]);
  const strength = strengthLabel(bits);
  const noCharsetSelected = !options.uppercase && !options.lowercase && !options.numbers && !options.symbols;

  function update(next: Partial<PasswordOptions>) {
    const merged = { ...options, ...next };
    setOptions(merged);
    regenerate(merged);
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10 lg:px-8">
      <ToolHeader tool={tool} />

      <Card className="p-5">
        <div className="flex items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded-lg bg-background px-3 py-2.5 font-mono text-sm">
            {noCharsetSelected ? "Select at least one character set" : password}
          </code>
          <Button variant="secondary" onClick={() => regenerate()} aria-label="Regenerate">
            <Icons.RefreshCw className="h-4 w-4" strokeWidth={1.75} />
          </Button>
          <CopyButton value={password} />
        </div>
        {!noCharsetSelected && (
          <div className="mt-2 flex items-center gap-2 text-xs text-muted">
            <Badge tone={strength.tone}>{strength.label}</Badge>
            <span>~{bits} bits of entropy</span>
          </div>
        )}
      </Card>

      <Card className="flex flex-col gap-5 p-5">
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <label htmlFor="length" className="font-medium">
              Length
            </label>
            <span className="tabular-nums text-muted">{options.length}</span>
          </div>
          <input
            id="length"
            type="range"
            min={6}
            max={64}
            value={options.length}
            onChange={(e) => update({ length: Number(e.target.value) })}
            className="w-full accent-accent"
          />
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {TOGGLES.map((t) => (
            <label key={t.key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={options[t.key]}
                onChange={(e) => update({ [t.key]: e.target.checked } as Partial<PasswordOptions>)}
                className="h-4 w-4 accent-accent"
              />
              {t.label}
            </label>
          ))}
        </div>
      </Card>
    </div>
  );
}
