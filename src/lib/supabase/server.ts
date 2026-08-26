import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";

import { publicEnv, supabaseConfigured } from "@/config/env";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

/**
 * Returns a server Supabase client, or `null` when Supabase isn't
 * configured. Server code (route handlers, server actions) must branch on
 * `null` and return a "workspace sync not configured" result rather than
 * throwing — ORBIT's tools must keep working without a database.
 */
export async function getSupabaseServerClient() {
  if (!supabaseConfigured) return null;

  const cookieStore = await cookies();

  return createServerClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL!,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component render — middleware refreshes
            // the session instead. Safe to ignore.
          }
        },
      },
    },
  );
}
