import type { SentenceSpan } from "./script";

/**
 * Advances through sentences at intervals proportional to each sentence's
 * share of the total character count. Used only when there's no real
 * timing signal available (speech synthesis unsupported) — an honestly
 * paced fallback, not a claim about actual audio timing.
 */
export function scheduleSentenceTimeline(
  sentences: SentenceSpan[],
  totalDurationMs: number,
  onSentenceChange: (index: number) => void
): () => void {
  if (sentences.length === 0) return () => {};
  const last = sentences[sentences.length - 1]!;
  const totalChars = Math.max(last.start + last.text.length, 1);
  const timers: number[] = [];
  sentences.forEach((sentence, i) => {
    if (i === 0) return;
    const delay = (sentence.start / totalChars) * totalDurationMs;
    timers.push(window.setTimeout(() => onSentenceChange(i), delay));
  });
  return () => timers.forEach((id) => window.clearTimeout(id));
}
