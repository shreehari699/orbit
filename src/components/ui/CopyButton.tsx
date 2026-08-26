"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "./Button";

export function CopyButton({ value, className = "" }: { value: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard permission denied — nothing more we can do here.
    }
  }

  return (
    <Button variant="secondary" onClick={handleCopy} disabled={!value} className={className}>
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}
