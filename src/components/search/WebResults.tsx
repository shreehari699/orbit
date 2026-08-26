"use client";

import { useState } from "react";
import * as Icons from "lucide-react";

import { requestWebSearch } from "@/lib/websearch/client";
import type { WebSearchResult } from "@/lib/websearch/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type Status = "idle" | "loading" | "done" | "not-configured" | "error";

export function WebResults({ query }: { query: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [results, setResults] = useState<WebSearchResult[]>([]);

  async function handleSearch() {
    setStatus("loading");
    try {
      const response = await requestWebSearch(query);
      if (!response.configured) {
        setStatus("not-configured");
        return;
      }
      if (response.error) {
        setStatus("error");
        return;
      }
      setResults(response.results ?? []);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icons.Globe className="h-4 w-4 text-accent" strokeWidth={1.75} />
          <h2 className="text-sm font-medium text-muted">Web</h2>
        </div>
        <Button variant="secondary" onClick={handleSearch} disabled={!query.trim() || status === "loading"}>
          {status === "loading" ? "Searching…" : "Search the web"}
        </Button>
      </div>

      {status === "not-configured" && (
        <Card className="p-4 text-sm text-muted">
          No web search provider is configured. Set{" "}
          <code className="rounded bg-black/[0.05] px-1 dark:bg-white/[0.08]">BRAVE_SEARCH_API_KEY</code> or{" "}
          <code className="rounded bg-black/[0.05] px-1 dark:bg-white/[0.08]">SERPER_API_KEY</code> to enable
          live web results — ORBIT&apos;s own tool search above still works either way.
        </Card>
      )}

      {status === "error" && (
        <Card className="border-danger/30 bg-danger/5 p-4 text-sm text-danger">
          The web search request failed. Try again in a moment.
        </Card>
      )}

      {status === "done" && results.length === 0 && (
        <Card className="p-4 text-sm text-muted">No web results for &quot;{query}&quot;.</Card>
      )}

      {status === "done" && results.length > 0 && (
        <div className="flex flex-col gap-2">
          {results.map((result) => (
            <Card key={result.url} className="p-4">
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-accent hover:underline"
              >
                {result.title}
              </a>
              <p className="mt-0.5 truncate text-xs text-muted">{result.url}</p>
              {result.snippet && <p className="mt-1 text-sm">{result.snippet}</p>}
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
