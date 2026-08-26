import { completeWithFallback, isAiConfigured } from "../router";
import { ProviderNotConfiguredError, type AiCompletionResult } from "../types";
import { TASK_SCHEMAS, buildTaskRequest, type TaskId, TaskValidationError } from "./tasks";

/**
 * The ORBIT AI Engine's single entry point: Tool Registry (which task is
 * this) → Context Engine (build the real request from validated input,
 * `buildTaskRequest`) → AI Router (`completeWithFallback`, provider
 * selection + fallback) → Result. Every AI-backed feature in ORBIT calls
 * through here — nowhere else constructs a provider request.
 */
export async function runTask(taskId: TaskId, rawInput: unknown): Promise<AiCompletionResult | { configured: false }> {
  if (!isAiConfigured()) {
    return { configured: false };
  }

  const schema = TASK_SCHEMAS[taskId];
  const parsed = schema.safeParse(rawInput);
  if (!parsed.success) {
    throw new TaskValidationError(parsed.error.issues.map((i) => i.message).join("; "));
  }

  const request = buildTaskRequest(taskId, parsed.data as never);

  try {
    return await completeWithFallback(request);
  } catch (error) {
    if (error instanceof ProviderNotConfiguredError) {
      return { configured: false };
    }
    throw error;
  }
}

export { TASK_SCHEMAS, TaskValidationError } from "./tasks";
export type { TaskId, TaskInput } from "./tasks";
