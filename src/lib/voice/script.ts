export interface SentenceSpan {
  text: string;
  start: number; // character offset into the full utterance text
}

export const PRIMARY_WELCOME_SCRIPT =
  "Welcome to ORBIT. Built by Zero Degree to bring your everyday digital tools, intelligence, and workflows together in one place. From documents and files to AI, search, and productivity, ORBIT is your universal workspace. How can I help you today?";

export const FALLBACK_WELCOME_SCRIPT =
  "Welcome to ORBIT. Built by Zero Degree to bring your tools, intelligence, and everyday workflows together. Your universal workspace is ready. How can I help you today?";

export function splitIntoSentences(text: string): SentenceSpan[] {
  const spans: SentenceSpan[] = [];
  const re = /[^.!?]+[.!?]+(?:\s+|$)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text))) {
    spans.push({ text: match[0].trim(), start: match.index });
  }
  return spans.length > 0 ? spans : [{ text, start: 0 }];
}

// A conservative mid-range speaking rate (words/minute) at utterance rate 1
// — used only to decide which script fits the ~8-12s target and to pace
// the silent-narrator fallback. Real elapsed time comes from the browser's
// own `boundary` events whenever they're available (see useSpeechSynthesis).
const WORDS_PER_MINUTE_BASELINE = 165;

export function estimateSpeechDurationMs(text: string, rate = 1): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return (words / (WORDS_PER_MINUTE_BASELINE * rate)) * 60000;
}

const MAX_TARGET_DURATION_MS = 12500;

/** Picks the primary script unless it would run long at the given rate, per spec. */
export function chooseWelcomeScript(rate = 1): { text: string; sentences: SentenceSpan[] } {
  const text =
    estimateSpeechDurationMs(PRIMARY_WELCOME_SCRIPT, rate) <= MAX_TARGET_DURATION_MS
      ? PRIMARY_WELCOME_SCRIPT
      : FALLBACK_WELCOME_SCRIPT;
  return { text, sentences: splitIntoSentences(text) };
}
