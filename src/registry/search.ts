import { TOOLS, type ToolDef } from "./tools";

export interface SearchResult {
  tool: ToolDef;
  score: number;
}

function score(tool: ToolDef, query: string): number {
  const q = query.toLowerCase();
  const label = tool.label.toLowerCase();
  const description = tool.description.toLowerCase();

  if (label === q) return 100;
  if (label.startsWith(q)) return 80;
  if (label.includes(q)) return 60;

  const keywordHit = tool.keywords.find((k) => k.toLowerCase().includes(q));
  if (keywordHit) return keywordHit.toLowerCase() === q ? 55 : 40;

  if (description.includes(q)) return 20;

  // Loose token overlap: every query word must appear somewhere.
  const words = q.split(/\s+/).filter(Boolean);
  if (words.length > 1) {
    const haystack = `${label} ${description} ${tool.keywords.join(" ")}`.toLowerCase();
    if (words.every((w) => haystack.includes(w))) return 15;
  }

  return 0;
}

/**
 * Ranks the tool registry against a free-text query. Returns everything
 * (sorted, best first) when the query is empty, so "browse all tools" and
 * "search tools" share one code path.
 */
export function searchTools(query: string): SearchResult[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return TOOLS.map((tool) => ({ tool, score: 0 }));
  }
  return TOOLS.map((tool) => ({ tool, score: score(tool, trimmed) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
}
