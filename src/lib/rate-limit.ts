/**
 * A minimal in-memory sliding-window rate limiter for AI-costing API
 * routes. Deliberately not a distributed limiter — it resets on every
 * server restart/redeploy and doesn't share state across serverless
 * instances. That's an honest, documented limitation, not a bug: it
 * still stops a single client from hammering the AI/image endpoints in
 * a running process, which is the realistic abuse case for a tool this
 * size. A real production deployment under sustained abuse should move
 * this to Supabase/Redis — the interface here doesn't need to change.
 */

interface Bucket {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, Bucket>();

// Periodically forget buckets so this Map can't grow unbounded across a
// long-lived server process.
const MAX_BUCKETS = 5000;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function checkRateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now - existing.windowStart >= windowMs) {
    if (buckets.size >= MAX_BUCKETS) buckets.clear();
    buckets.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  if (existing.count >= limit) {
    const retryAfterSeconds = Math.ceil((existing.windowStart + windowMs - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  existing.count += 1;
  return { allowed: true, remaining: limit - existing.count, retryAfterSeconds: 0 };
}

/** Best-effort caller identity from standard proxy headers — good enough to key a rate limit, not for authentication. */
export function getClientKey(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
