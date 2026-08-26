import { z } from "zod";

/**
 * ORBIT environment configuration.
 *
 * Unlike a backend-first app, ORBIT's core (Command Center, search, the
 * utility tools, local PDF extraction) must work with zero configuration —
 * so every variable here is optional. A missing value disables exactly the
 * feature that depends on it (Supabase sync, an AI provider, an image
 * provider, a Zero Degree app link); it never causes the app to fail to
 * boot and never causes a feature to silently fake its output.
 */

const emptyToUndefined = (v: unknown) =>
  typeof v === "string" && v.length === 0 ? undefined : v;

const optionalUrl = z.preprocess(emptyToUndefined, z.string().url().optional());
const optionalString = z.preprocess(emptyToUndefined, z.string().min(1).optional());

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  SUPABASE_SERVICE_ROLE_KEY: optionalString,

  GEMINI_API_KEY: optionalString,
  GEMINI_MODEL: optionalString,
  ANTHROPIC_API_KEY: optionalString,
  OPENAI_API_KEY: optionalString,

  OPENAI_IMAGE_API_KEY: optionalString,
  STABILITY_API_KEY: optionalString,

  TAVILY_API_KEY: optionalString,
  BRAVE_SEARCH_API_KEY: optionalString,
  SERPER_API_KEY: optionalString,
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),

  NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalString,

  NEXT_PUBLIC_ZHUB_URL: optionalUrl,
  NEXT_PUBLIC_LOOP_URL: optionalUrl,
  NEXT_PUBLIC_CIVI_URL: optionalUrl,
});

/**
 * Referenced explicitly (not via a dynamic loop) so Next.js can statically
 * inline `process.env.NEXT_PUBLIC_*` into the client bundle at build time.
 */
const clientEnv = {
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_ZHUB_URL: process.env.NEXT_PUBLIC_ZHUB_URL,
  NEXT_PUBLIC_LOOP_URL: process.env.NEXT_PUBLIC_LOOP_URL,
  NEXT_PUBLIC_CIVI_URL: process.env.NEXT_PUBLIC_CIVI_URL,
};

function formatIssues(issues: z.ZodIssue[]): string {
  return issues.map((issue) => `  • ${issue.path.join(".")}: ${issue.message}`).join("\n");
}

const parsedClient = clientSchema.safeParse(clientEnv);
if (!parsedClient.success) {
  throw new Error(`Invalid public environment variables:\n${formatIssues(parsedClient.error.issues)}`);
}

export const publicEnv = parsedClient.data;

let parsedServer: z.infer<typeof serverSchema> | undefined;

/**
 * Server-only config. Importing from a client component is a build-time
 * error via the "server-only" style guard below (throws instead of
 * returning `undefined`, so a misuse fails loudly in development).
 */
export function serverEnv(): z.infer<typeof serverSchema> {
  if (typeof window !== "undefined") {
    throw new Error("serverEnv() was called in a client context.");
  }
  if (!parsedServer) {
    const result = serverSchema.safeParse(process.env);
    if (!result.success) {
      throw new Error(`Invalid server environment variables:\n${formatIssues(result.error.issues)}`);
    }
    parsedServer = result.data;
  }
  return parsedServer;
}

export const supabaseConfigured = Boolean(
  publicEnv.NEXT_PUBLIC_SUPABASE_URL && publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
