const ENABLED_KEY = "orbit:voice-welcome-enabled";

/** Defaults to enabled — absence of the key means the user has never turned it off. */
export function isVoiceWelcomeEnabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(ENABLED_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setVoiceWelcomeEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ENABLED_KEY, enabled ? "on" : "off");
  } catch {
    // Storage unavailable (private browsing, quota) — the toggle still
    // works for the current session via component state; it just won't
    // persist across visits.
  }
}
