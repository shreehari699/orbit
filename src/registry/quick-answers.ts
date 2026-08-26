import { evaluateExpression } from "@/lib/math/evaluate";
import {
  UNIT_CATEGORIES,
  convert,
  convertTemperature,
  findTemperatureUnit,
  findUnit,
} from "@/lib/units/convert";

export interface QuickAnswer {
  type: "math" | "unit" | "word-count";
  query: string;
  result: string;
  detail?: string;
}

function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return String(n);
  const rounded = Math.round(n * 1e6) / 1e6;
  return rounded.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

const CONVERSION_PATTERN = /^(-?[\d.]+)\s*([a-zA-Z°/]+)\s+(?:to|in|as)\s+([a-zA-Z°/]+)$/i;

function tryUnitConversion(query: string): QuickAnswer | null {
  const match = query.trim().match(CONVERSION_PATTERN);
  if (!match) return null;
  const [, rawValue, fromToken, toToken] = match;
  const value = Number(rawValue);
  if (!Number.isFinite(value)) return null;

  const fromTemp = findTemperatureUnit(fromToken!);
  const toTemp = findTemperatureUnit(toToken!);
  if (fromTemp && toTemp) {
    const result = convertTemperature(value, fromTemp, toTemp);
    return {
      type: "unit",
      query,
      result: `${formatNumber(result)}°${toTemp.toUpperCase()}`,
      detail: `${formatNumber(value)}°${fromTemp.toUpperCase()} → °${toTemp.toUpperCase()}`,
    };
  }

  for (const category of UNIT_CATEGORIES) {
    const from = findUnit(category, fromToken!);
    const to = findUnit(category, toToken!);
    if (from && to) {
      const result = convert(category, value, fromToken!, toToken!);
      if (result === null) continue;
      return {
        type: "unit",
        query,
        result: `${formatNumber(result)} ${to.id}`,
        detail: `${category.label}: ${formatNumber(value)} ${from.id} → ${to.id}`,
      };
    }
  }
  return null;
}

const WORD_COUNT_PATTERN = /^(?:count|words?)\s*:\s*(.+)$/is;

function tryWordCount(query: string): QuickAnswer | null {
  const match = query.match(WORD_COUNT_PATTERN);
  if (!match) return null;
  const text = match[1]!.trim();
  if (!text) return null;
  const words = text.split(/\s+/).filter(Boolean).length;
  const chars = text.length;
  return {
    type: "word-count",
    query,
    result: `${words} word${words === 1 ? "" : "s"}`,
    detail: `${chars} character${chars === 1 ? "" : "s"}`,
  };
}

function tryMath(query: string): QuickAnswer | null {
  const result = evaluateExpression(query);
  if (result === null) return null;
  return { type: "math", query, result: formatNumber(result) };
}

/**
 * Tries every deterministic quick-answer strategy in order and returns the
 * first match, or `null` if the query isn't a recognized shorthand — the
 * caller then falls back to fuzzy tool search. Order matters: unit
 * conversion and word-count are checked before the generic math evaluator
 * since their patterns are more specific.
 */
export function getQuickAnswer(query: string): QuickAnswer | null {
  const trimmed = query.trim();
  if (!trimmed) return null;
  return tryUnitConversion(trimmed) ?? tryWordCount(trimmed) ?? tryMath(trimmed);
}
