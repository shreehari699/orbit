# ORBIT database (Supabase / PostgreSQL)

**Status: a live Supabase project exists; schema validated locally; not
yet applied to that live project.** A dedicated ORBIT project
(`https://jnmhtppabrodkzfpqess.supabase.co`) and its API keys were
provided in a later session. Applying migrations to it from *this*
development sandbox is blocked at the network layer, not by a missing
credential: this sandbox's outbound egress is a strict allowlist (npm/
PyPI/crates/Go-proxy registries plus Anthropic's own API), and that
Supabase project's host isn't on it — confirmed via the proxy's own
status endpoint and a direct `curl`, both returning a policy-level 403
on `CONNECT`, the same way it blocks e.g. `jsdelivr.net`. Per that
proxy's own operating instructions, a blocked host is reported, not
routed around — no bypass was attempted. A real production deployment
(e.g. Vercel) or any machine with normal internet access does not have
this restriction and can run these migrations and connect normally. No
ORBIT feature currently depends on this database yet either way — the
app runs today entirely without one (workspace state lives in
`localStorage`; see `src/lib/workspace/`).

**Security note:** the API keys for this project were pasted directly
into a chat conversation. Treat the `service_role` key in particular as
sensitive from that point on — rotating it in the Supabase dashboard
after setup is complete is good practice regardless of anything in this
repository, since a chat transcript is a wider exposure surface than a
secrets manager. Nothing in this repository ever received that key: it
was written only to a local, gitignored `.env.local` for a connectivity
test (itself blocked, see above) and is not present anywhere in the git
history — verified by scanning every commit on every branch, not
assumed.

What "validated locally" means concretely: every migration and `seed.sql`
were run, in order, against a real local PostgreSQL 16 instance (with a
minimal stub of Supabase's `auth.users` table and `auth.uid()`) — not just
read over. That run caught and fixed one real bug (`to_tsvector(...)`
inside a `generated always as (...) stored` column is rejected by
Postgres because the function is STABLE, not IMMUTABLE — `0003` now
maintains the tsvector via a trigger instead). After the fix, all 6
migrations plus the seed applied cleanly, and RLS was exercised for
real: a non-owner `test_authenticated` role was created, two users'
`favorites` rows were seeded, and querying as each user (via a
`request.jwt.claim.sub` GUC standing in for a Supabase JWT) confirmed
each only sees their own row — and a cross-user insert attempt was
rejected by the RLS policy, not just described as blocked. Full-text
search was exercised too: `search_resources('javascript docs', 5)`
correctly ranked a seeded MDN row, and trigram matching (`title % 'pdf
assoc'`) found "PDF Association" from a fuzzy substring. None of that
touched a real Supabase project — it's local Postgres standing in for
one — so this is schema correctness and RLS logic verified, not proof the
live Supabase environment behaves identically (Supabase's real `auth.uid()`
and RLS enforcement are what actually govern production).

Applying them is what turns on: cross-device favorites/history/notes,
document sessions for PDF Intelligence's "study mode", and a real
full-text search index behind ORBIT Search's "Web" tab neighbor — the
internal resource index described below.

## To apply

The project already exists — `https://jnmhtppabrodkzfpqess.supabase.co`,
dedicated to ORBIT, separate from Z Hub's. From any machine with normal
internet access (i.e. not this development sandbox):

1. Either paste each file in `migrations/`, in filename order, into the
   SQL editor at supabase.com/dashboard for this project (simplest — no
   local setup needed), or install the Supabase CLI and run
   `supabase link --project-ref jnmhtppabrodkzfpqess` (prompts for the
   database password, set at project creation) followed by
   `supabase db push` from this directory's parent.
2. Optionally run `seed.sql` to populate `categories`, `tools`, and
   `zero_degree_apps` with ORBIT's actual current registry (not filler —
   every row mirrors `src/registry/tools.ts` and `src/registry/apps.ts`
   at the time this was written).
4. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
   `SUPABASE_SERVICE_ROLE_KEY` in ORBIT's environment. `src/config/env.ts`
   treats all three as optional — the app boots identically either way —
   but `src/lib/supabase/browser.ts` and `server.ts` return real clients
   once they're set.

## Schema overview

| File | Tables | Purpose |
|---|---|---|
| `0001_extensions_and_profiles.sql` | `profiles` | One row per Supabase Auth user; RLS scoped to `auth.uid()`. |
| `0002_catalog.sql` | `categories`, `tools`, `zero_degree_apps` | Public read-only reference data — ORBIT's tool registry and app family, mirrored into the database so it can be queried/joined rather than only living in TypeScript. |
| `0003_resources_search_index.sql` | `resources` | The internal search index (Section 8 of the spec): full-text search via `tsvector` + GIN index, `pg_trgm` for fuzzy/prefix matching, weighted ranking (title > description > tags). Seeded modestly (see below) — not 1000+ rows. |
| `0004_workspace.sql` | `favorites`, `recent`, `notes`, `highlights` | Per-user workspace state. Every row is owned by `auth.uid()` and RLS-scoped so a user can only ever see their own. |
| `0005_documents.sql` | `documents`, `document_sessions` | PDF Intelligence's flagship "study mode": uploaded-document metadata (never the file body — that belongs in Supabase Storage under a user-scoped path) and per-session state (open questions, cited pages). |
| `0006_usage_and_preferences.sql` | `search_history`, `ai_usage`, `user_preferences` | Per-user search log, AI-call usage log (for future rate limiting — no billing logic implied), and preferences (theme, default AI provider, etc). |

Every user-owned table enables Row Level Security with a `USING
(auth.uid() = user_id)` policy (read) and a matching `WITH CHECK` (write) —
nobody can read or write another user's rows through the anon/authenticated
Supabase client, only through the service-role key from trusted server code.

## On "1000+ records"

The spec calls for the `resources` index to eventually hold 1000+ useful,
real records (educational, developer, AI, productivity, document, image,
and student resources). `seed.sql` intentionally does **not** attempt
that: fabricating hundreds of external resource URLs and descriptions
without verifying each one is a fabrication risk, not a shortcut. The
schema and full-text search are ready for that scale; populating it
with genuinely useful, verified entries is ongoing curation work for
whoever operates the live project, ideally sourced via `WebSearchProvider`
lookups or manual curation rather than invented in bulk.
