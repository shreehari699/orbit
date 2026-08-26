"use client";

import { useEffect, useMemo, useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";

import { getToolById } from "@/registry/tools";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { CopyButton } from "@/components/ui/CopyButton";

const tool = getToolById("markdown-converter")!;
const SAMPLE = "# ORBIT\n\nA **fast**, _honest_ workspace.\n\n- Search\n- Tools\n- AI\n\n[Learn more](https://example.com)";

marked.setOptions({ gfm: true, breaks: true });

export function MarkdownConverter() {
  const [markdown, setMarkdown] = useState("");
  const [html, setHtml] = useState("");

  const rawHtml = useMemo(() => (markdown.trim() ? (marked.parse(markdown) as string) : ""), [markdown]);

  useEffect(() => {
    // DOMPurify needs a document, so sanitization runs client-side only.
    setHtml(rawHtml ? DOMPurify.sanitize(rawHtml) : "");
  }, [rawHtml]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 lg:px-8">
      <ToolHeader tool={tool} />

      <button
        onClick={() => setMarkdown(SAMPLE)}
        className="w-fit text-xs text-accent hover:underline"
      >
        Load sample
      </button>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
            Markdown
          </label>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="# Type Markdown here…"
            spellCheck={false}
            rows={16}
            className="orbit-scrollbar w-full resize-y rounded-2xl border border-border bg-surface p-4 font-mono text-sm outline-none placeholder:text-muted focus:border-accent/50"
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-xs font-medium uppercase tracking-wide text-muted">Preview</label>
            <CopyButton value={html} />
          </div>
          <div
            className="orbit-scrollbar prose prose-sm h-[26rem] max-w-none overflow-y-auto rounded-2xl border border-border bg-surface p-4 dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: html || "<p class='text-muted'>Nothing to preview yet.</p>" }}
          />
        </div>
      </div>
    </div>
  );
}
