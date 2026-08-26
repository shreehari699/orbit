const CHARSETS = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
} as const;

export interface PasswordOptions {
  length: number;
  lowercase: boolean;
  uppercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

/** Generates a password using the browser's CSPRNG (`crypto.getRandomValues`) — never `Math.random`. */
export function generatePassword(options: PasswordOptions): string {
  const pool = (Object.keys(CHARSETS) as (keyof typeof CHARSETS)[])
    .filter((key) => options[key])
    .map((key) => CHARSETS[key])
    .join("");

  if (!pool) return "";

  const bytes = new Uint32Array(options.length);
  crypto.getRandomValues(bytes);

  let result = "";
  for (let i = 0; i < options.length; i++) {
    result += pool[bytes[i]! % pool.length];
  }
  return result;
}

/** A simple, honest entropy estimate — not a substitute for a real strength meter, but real math, not a fake bar. */
export function estimateEntropyBits(options: PasswordOptions): number {
  const poolSize =
    (options.lowercase ? 26 : 0) +
    (options.uppercase ? 26 : 0) +
    (options.numbers ? 10 : 0) +
    (options.symbols ? CHARSETS.symbols.length : 0);
  if (poolSize === 0) return 0;
  return Math.round(options.length * Math.log2(poolSize));
}

export function strengthLabel(bits: number): { label: string; tone: "danger" | "neutral" | "success" } {
  if (bits < 40) return { label: "Weak", tone: "danger" };
  if (bits < 70) return { label: "Fair", tone: "neutral" };
  if (bits < 100) return { label: "Strong", tone: "success" };
  return { label: "Very strong", tone: "success" };
}
