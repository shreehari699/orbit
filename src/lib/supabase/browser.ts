"use client";

import { createBrowserClient } from "@supabase/ssr";

import { publicEnv, supabaseConfigured } from "@/config/env";

let client: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Returns a browser Supabase client, or `null` when Supabase isn't
 * configured. Callers (workspace sync) must handle `null` by falling back
 * to local-only storage — never by pretending a connection exists.
 */
export function getSupabaseBrowserClient() {
  if (!supabaseConfigured) return null;
  if (!client) {
    client = createBrowserClient(
      publicEnv.NEXT_PUBLIC_SUPABASE_URL!,
      publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return client;
}
