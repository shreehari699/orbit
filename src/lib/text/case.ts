/** Splits arbitrary text (spaces, hyphens, underscores, camelCase) into words. */
function toWords(input: string): string[] {
  return input
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[\s_-]+/)
    .filter(Boolean);
}

export function toUpperCase(input: string): string {
  return input.toUpperCase();
}

export function toLowerCase(input: string): string {
  return input.toLowerCase();
}

export function toTitleCase(input: string): string {
  return toWords(input)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export function toSentenceCase(input: string): string {
  const lower = input.toLowerCase().trim();
  if (!lower) return "";
  return lower.replace(/(^\s*\w|[.!?]\s+\w)/g, (m) => m.toUpperCase());
}

export function toCamelCase(input: string): string {
  const words = toWords(input).map((w) => w.toLowerCase());
  return words
    .map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join("");
}

export function toPascalCase(input: string): string {
  return toWords(input)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");
}

export function toSnakeCase(input: string): string {
  return toWords(input)
    .map((w) => w.toLowerCase())
    .join("_");
}

export function toKebabCase(input: string): string {
  return toWords(input)
    .map((w) => w.toLowerCase())
    .join("-");
}

export const CASE_CONVERTERS = [
  { id: "upper", label: "UPPERCASE", convert: toUpperCase },
  { id: "lower", label: "lowercase", convert: toLowerCase },
  { id: "title", label: "Title Case", convert: toTitleCase },
  { id: "sentence", label: "Sentence case", convert: toSentenceCase },
  { id: "camel", label: "camelCase", convert: toCamelCase },
  { id: "pascal", label: "PascalCase", convert: toPascalCase },
  { id: "snake", label: "snake_case", convert: toSnakeCase },
  { id: "kebab", label: "kebab-case", convert: toKebabCase },
] as const;
