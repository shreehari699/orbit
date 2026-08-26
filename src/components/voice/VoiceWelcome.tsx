"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";

import type { OrbitCoreState } from "@/components/motion/OrbitCore";
import { WelcomeOverlay } from "./WelcomeOverlay";
import { useOrbitVoice } from "@/lib/voice/useSpeechSynthesis";
import { chooseWelcomeScript, estimateSpeechDurationMs } from "@/lib/voice/script";
import { scheduleSentenceTimeline } from "@/lib/voice/timeline";
import { isVoiceWelcomeEnabled, setVoiceWelcomeEnabled } from "@/lib/voice/preferences";

type Phase = "hidden" | "intro" | "speaking" | "blocked" | "complete";

export const REPLAY_EVENT = "orbit:replay-voice-welcome";

const SPEECH_RATE = 1;
const INTRO_DELAY_MS = 450;
const COMPLETE_HOLD_MS = 900;

/**
 * ORBIT's cinematic voice welcome — UI + native SpeechSynthesis only.
 * Never activates the microphone, never calls Gemini, never sends the
 * welcome text anywhere. Mounted once in the app shell layout, so it
 * naturally plays once per app-shell load rather than per navigation.
 */
export function VoiceWelcome() {
  const [phase, setPhase] = useState<Phase>("hidden");
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const { supported, speak, cancel } = useOrbitVoice();
  const scriptRef = useRef(chooseWelcomeScript(SPEECH_RATE));
  const startedRef = useRef(false);

  function beginSpeaking() {
    setSentenceIndex(0);
    setPhase("speaking");
    speak({
      text: scriptRef.current.text,
      sentences: scriptRef.current.sentences,
      rate: SPEECH_RATE,
      onSentenceChange: setSentenceIndex,
      onEnd: () => setPhase("complete"),
      onBlocked: () => setPhase("blocked"),
    });
  }

  // Kick off on mount, but only once, and only if the user hasn't turned
  // the welcome off in settings.
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    if (!isVoiceWelcomeEnabled()) return;
    setPhase("intro");
  }, []);

  // Allow ORBIT settings to trigger a manual replay regardless of the
  // stored preference — an explicit user action, not an autoplay attempt.
  useEffect(() => {
    function onReplay() {
      cancel();
      setPhase("intro");
    }
    window.addEventListener(REPLAY_EVENT, onReplay);
    return () => window.removeEventListener(REPLAY_EVENT, onReplay);
  }, [cancel]);

  useEffect(() => {
    if (phase !== "intro") return;
    const introTimer = window.setTimeout(() => {
      if (!supported) {
        // Speech unavailable — still walk through the transcript, paced
        // honestly rather than left static, then continue into the app.
        setSentenceIndex(0);
        setPhase("speaking");
        const totalMs = estimateSpeechDurationMs(scriptRef.current.text, SPEECH_RATE);
        const cancelTimeline = scheduleSentenceTimeline(scriptRef.current.sentences, totalMs, setSentenceIndex);
        const endTimer = window.setTimeout(() => setPhase("complete"), totalMs + 400);
        return () => {
          cancelTimeline();
          window.clearTimeout(endTimer);
        };
      }
      beginSpeaking();
    }, INTRO_DELAY_MS);
    return () => window.clearTimeout(introTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, supported]);

  useEffect(() => {
    if (phase !== "complete") return;
    const timer = window.setTimeout(() => setPhase("hidden"), COMPLETE_HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  if (phase === "hidden") return null;

  const coreState: OrbitCoreState =
    phase === "intro" ? "intro" : phase === "speaking" ? "speaking" : phase === "complete" ? "complete" : "idle";

  return (
    <AnimatePresence>
      <WelcomeOverlay
        key="voice-welcome"
        coreState={coreState}
        sentence={scriptRef.current.sentences[sentenceIndex]?.text ?? ""}
        blocked={phase === "blocked"}
        showMute={phase === "speaking" && supported}
        onSkip={() => {
          cancel();
          setPhase("hidden");
        }}
        onMute={() => {
          cancel();
          setPhase("complete");
        }}
        onEnableVoice={() => {
          setVoiceWelcomeEnabled(true);
          beginSpeaking();
        }}
        onNotNow={() => setPhase("hidden")}
      />
    </AnimatePresence>
  );
}
