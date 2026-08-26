"use client";

import { useState } from "react";

import { requestAiCompletion } from "./client";

export type AiCompletionStatus = "idle" | "loading" | "done" | "not-configured" | "error";

export function useAiCompletion() {
  const [status, setStatus] = useState<AiCompletionStatus>("idle");
  const [output, setOutput] = useState("");

  async function run(prompt: string, options?: { system?: string; maxTokens?: number }) {
    setStatus("loading");
    setOutput("");
    try {
      const response = await requestAiCompletion(prompt, options);
      if (!response.configured) {
        setStatus("not-configured");
        return;
      }
      if (response.error) {
        setStatus("error");
        return;
      }
      setOutput(response.text ?? "");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return { status, output, run };
}
