"use client";

import { useState } from "react";

import { requestAiTask } from "./client";
import type { AiErrorKind } from "./types";
import type { TaskId } from "./engine";

export type AiCompletionStatus = "idle" | "loading" | "done" | "not-configured" | "error";

const FALLBACK_ERROR_MESSAGE = "The AI provider request failed. Try again in a moment.";

export function useAiCompletion() {
  const [status, setStatus] = useState<AiCompletionStatus>("idle");
  const [output, setOutput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [errorKind, setErrorKind] = useState<AiErrorKind | null>(null);

  async function run(taskId: TaskId, input: unknown) {
    setStatus("loading");
    setOutput("");
    setErrorMessage("");
    setErrorKind(null);
    try {
      const response = await requestAiTask(taskId, input);
      if (!response.configured) {
        setStatus("not-configured");
        return;
      }
      if (response.error) {
        setStatus("error");
        setErrorMessage(response.error);
        setErrorKind(response.errorKind ?? null);
        return;
      }
      setOutput(response.text ?? "");
      setStatus("done");
    } catch {
      setStatus("error");
      setErrorMessage(FALLBACK_ERROR_MESSAGE);
    }
  }

  return { status, output, errorMessage: errorMessage || FALLBACK_ERROR_MESSAGE, errorKind, run };
}
