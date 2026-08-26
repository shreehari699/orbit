"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { SentenceSpan } from "./script";

interface SpeakArgs {
  text: string;
  sentences: SentenceSpan[];
  rate?: number;
  pitch?: number;
  volume?: number;
  onSentenceChange?: (index: number) => void;
  onEnd?: () => void;
  onBlocked?: () => void;
}

const BLOCKED_TIMEOUT_MS = 1500;
const BOUNDARY_GRACE_MS = 1200;
const WORDS_PER_MINUTE_BASELINE = 165;

function pickEnglishVoice(voices: SpeechSynthesisVoice[]) {
  const english = voices.filter((v) => v.lang?.toLowerCase().startsWith("en"));
  return (
    english.find((v) => /natural|neural|premium|enhanced/i.test(v.name)) ??
    english.find((v) => v.default) ??
    english[0] ??
    voices[0]
  );
}

function sentenceIndexForCharIndex(sentences: SentenceSpan[], charIndex: number) {
  let index = 0;
  for (let i = 0; i < sentences.length; i++) {
    if (charIndex >= sentences[i]!.start) index = i;
  }
  return index;
}

/**
 * A thin wrapper over the browser's native SpeechSynthesis API — no
 * third-party TTS, no server calls, no microphone access. Sentence-level
 * text sync prefers real `boundary` events from the speech engine; only
 * when a browser never fires them does it fall back to an honestly-paced
 * timer schedule (never fabricated word-level sync).
 */
export function useOrbitVoice() {
  const [supported, setSupported] = useState(false);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && Boolean(window.speechSynthesis));
  }, []);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const getVoices = useCallback((): Promise<SpeechSynthesisVoice[]> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        resolve([]);
        return;
      }
      const existing = window.speechSynthesis.getVoices();
      if (existing.length > 0) {
        resolve(existing);
        return;
      }
      const handle = () => {
        window.speechSynthesis.removeEventListener("voiceschanged", handle);
        resolve(window.speechSynthesis.getVoices());
      };
      window.speechSynthesis.addEventListener("voiceschanged", handle);
      window.setTimeout(() => resolve(window.speechSynthesis.getVoices()), 500);
    });
  }, []);

  const cancel = useCallback(() => {
    clearTimers();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [clearTimers]);

  const speak = useCallback(
    async ({ text, sentences, rate = 1, pitch = 1, volume = 1, onSentenceChange, onEnd, onBlocked }: SpeakArgs) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        onBlocked?.();
        return;
      }

      const voices = await getVoices();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;
      const voice = pickEnglishVoice(voices);
      if (voice) utterance.voice = voice;

      let started = false;
      let boundaryDriven = false;

      const words = text.trim().split(/\s+/).filter(Boolean).length;
      const estimatedTotalMs = (words / (WORDS_PER_MINUTE_BASELINE * rate)) * 60000;

      function scheduleFallback() {
        sentences.forEach((sentence, i) => {
          if (i === 0) return;
          const last = sentences[sentences.length - 1]!;
          const totalChars = Math.max(last.start + last.text.length, 1);
          const delay = (sentence.start / totalChars) * estimatedTotalMs;
          const id = window.setTimeout(() => {
            if (!boundaryDriven) onSentenceChange?.(i);
          }, delay);
          timersRef.current.push(id);
        });
      }

      const blockedTimer = window.setTimeout(() => {
        if (!started) {
          window.speechSynthesis.cancel();
          onBlocked?.();
        }
      }, BLOCKED_TIMEOUT_MS);
      timersRef.current.push(blockedTimer);

      utterance.onstart = () => {
        started = true;
        onSentenceChange?.(0);
        const boundaryCheckTimer = window.setTimeout(() => {
          if (!boundaryDriven) scheduleFallback();
        }, BOUNDARY_GRACE_MS);
        timersRef.current.push(boundaryCheckTimer);
      };

      utterance.onboundary = (event) => {
        if (event.name && event.name !== "word" && event.name !== "sentence") return;
        boundaryDriven = true;
        onSentenceChange?.(sentenceIndexForCharIndex(sentences, event.charIndex));
      };

      utterance.onend = () => {
        clearTimers();
        onEnd?.();
      };

      utterance.onerror = (event) => {
        clearTimers();
        if (!started || event.error === "interrupted" || event.error === "canceled") {
          onBlocked?.();
        } else {
          onEnd?.();
        }
      };

      window.speechSynthesis.speak(utterance);
    },
    [getVoices, clearTimers]
  );

  useEffect(() => cancel, [cancel]);

  return { supported, speak, cancel };
}
