/**
 * The tool registry — the single source of truth for every utility ORBIT
 * ships. Command Center, ORBIT Search, the sidebar, and favorites/history
 * all read from this list rather than hardcoding tool metadata, so a new
 * tool is added in exactly one place.
 */

export type ToolCategory = "text" | "convert" | "data" | "document";

export interface ToolDef {
  id: string;
  label: string;
  description: string;
  href: string;
  category: ToolCategory;
  icon: string; // lucide-react icon name
  keywords: string[];
}

export const TOOL_CATEGORIES: { id: ToolCategory; label: string }[] = [
  { id: "text", label: "Text" },
  { id: "convert", label: "Convert" },
  { id: "data", label: "Data" },
  { id: "document", label: "Document" },
];

export const TOOLS: ToolDef[] = [
  {
    id: "word-counter",
    label: "Word & Character Counter",
    description: "Live word, character, sentence, and reading-time stats as you type.",
    href: "/tools/word-counter",
    category: "text",
    icon: "Type",
    keywords: ["words", "characters", "count", "reading time", "letters"],
  },
  {
    id: "text-case",
    label: "Text Case Converter",
    description: "Switch between UPPER, lower, Title, Sentence, camelCase, and snake_case.",
    href: "/tools/text-case",
    category: "text",
    icon: "CaseSensitive",
    keywords: ["uppercase", "lowercase", "title case", "camelcase", "snake_case", "case"],
  },
  {
    id: "unit-converter",
    label: "Unit Converter",
    description: "Convert length, mass, volume, speed, digital storage, and temperature.",
    href: "/tools/unit-converter",
    category: "convert",
    icon: "ArrowLeftRight",
    keywords: ["convert", "units", "km", "miles", "kg", "lb", "celsius", "fahrenheit"],
  },
  {
    id: "json-formatter",
    label: "JSON Formatter",
    description: "Format, minify, and validate JSON with inline error location.",
    href: "/tools/json-formatter",
    category: "data",
    icon: "Braces",
    keywords: ["json", "format", "pretty print", "minify", "validate"],
  },
  {
    id: "pdf-intelligence",
    label: "PDF Intelligence",
    description: "Extract text, page count, and reading stats from a PDF — with optional AI summary.",
    href: "/pdf-intelligence",
    category: "document",
    icon: "FileSearch",
    keywords: ["pdf", "extract", "summary", "document", "text extraction"],
  },
];

export function getToolById(id: string): ToolDef | undefined {
  return TOOLS.find((t) => t.id === id);
}
