"use client";

import { useEffect, useState } from "react";
import * as Icons from "lucide-react";

import { Card } from "@/components/ui/Card";
import { isVoiceWelcomeEnabled, setVoiceWelcomeEnabled } from "@/lib/voice/preferences";
import { REPLAY_EVENT } from "@/components/voice/VoiceWelcome";

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (next: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`orbit-focus relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
        checked ? "bg-accent" : "bg-black/[0.12] dark:bg-white/[0.16]"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-[var(--shadow-card)] transition-transform duration-200 ${
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export function SettingsView() {
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [replayed, setReplayed] = useState(false);

  useEffect(() => {
    setVoiceEnabled(isVoiceWelcomeEnabled());
  }, []);

  function handleToggle(next: boolean) {
    setVoiceEnabled(next);
    setVoiceWelcomeEnabled(next);
  }

  function handleReplay() {
    window.dispatchEvent(new CustomEvent(REPLAY_EVENT));
    setReplayed(true);
    window.setTimeout(() => setReplayed(false), 2000);
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10 lg:px-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted">Preferences for how ORBIT looks and behaves.</p>
      </div>

      <Card className="flex flex-col divide-y divide-border">
        <div className="flex items-center justify-between gap-4 p-5">
          <div className="flex items-start gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-accent/10 text-accent">
              <Icons.Volume2 className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Voice Welcome</p>
              <p className="mt-0.5 text-xs text-muted">
                Plays a short spoken welcome when ORBIT opens, using your browser&apos;s built-in voice. No
                microphone access, no AI usage.
              </p>
            </div>
          </div>
          <Toggle checked={voiceEnabled} onChange={handleToggle} label="Voice Welcome" />
        </div>

        <div className="flex items-center justify-between gap-4 p-5">
          <div className="flex items-start gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-accent/10 text-accent">
              <Icons.RotateCcw className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Replay welcome</p>
              <p className="mt-0.5 text-xs text-muted">Hear the ORBIT welcome again right now.</p>
            </div>
          </div>
          <button
            onClick={handleReplay}
            className="orbit-focus shrink-0 rounded-control bg-black/[0.05] px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-black/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.1]"
          >
            {replayed ? "Playing…" : "Replay"}
          </button>
        </div>
      </Card>
    </div>
  );
}
