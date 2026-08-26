export interface JsonParseResult {
  ok: boolean;
  value?: unknown;
  message?: string;
  line?: number;
  column?: number;
}

/** Extracts the character offset V8 reports in "...at position N" errors. */
function extractPosition(message: string): number | null {
  const match = message.match(/position (\d+)/i);
  return match ? Number(match[1]) : null;
}

function positionToLineColumn(text: string, position: number): { line: number; column: number } {
  let line = 1;
  let column = 1;
  for (let i = 0; i < position && i < text.length; i++) {
    if (text[i] === "\n") {
      line++;
      column = 1;
    } else {
      column++;
    }
  }
  return { line, column };
}

export function parseJson(text: string): JsonParseResult {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid JSON";
    const position = extractPosition(message);
    if (position !== null) {
      const { line, column } = positionToLineColumn(text, position);
      return { ok: false, message, line, column };
    }
    return { ok: false, message };
  }
}

export function formatJson(text: string, indent = 2): JsonParseResult & { output?: string } {
  const result = parseJson(text);
  if (!result.ok) return result;
  return { ...result, output: JSON.stringify(result.value, null, indent) };
}

export function minifyJson(text: string): JsonParseResult & { output?: string } {
  const result = parseJson(text);
  if (!result.ok) return result;
  return { ...result, output: JSON.stringify(result.value) };
}
