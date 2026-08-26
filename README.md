# ORBIT

ORBIT is Zero Degree's productivity workspace: a Command Center, a universal
search bar, a growing registry of utility tools, and PDF Intelligence — with
pluggable AI and image-generation providers and links out to the rest of the
Zero Degree app family (Z Hub, LOOP, CIVI).

This is a standalone product with its own codebase, environment
configuration, and deployment target. It does not share a database,
authentication, or runtime with Z Hub.

## Stack

- Next.js 15 (App Router) / React 19 / TypeScript
- Tailwind CSS 4
- Zod-validated environment config, all of it optional at boot
- Supabase (optional) for cross-device workspace sync — falls back to
  `localStorage` when unconfigured
- Pluggable AI provider (Anthropic / OpenAI / none) and image-generation
  provider (OpenAI Images / Stability / none) architectures

## Getting started

```bash
pnpm install
cp .env.example .env.local   # optional — everything works unconfigured
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `pnpm dev` — start the dev server
- `pnpm build` — production build
- `pnpm typecheck` — `tsc --noEmit`
- `pnpm lint` — ESLint

## Project layout

```
app/                    Route segments (App Router)
  (app)/                Authenticated-agnostic app shell: sidebar + topbar
    page.tsx            Command Center (home)
    search/              Universal ORBIT Search
    tools/*/             Utility tools
    pdf-intelligence/     PDF Intelligence
    apps/                 Zero Degree app registry / switcher
    integrations/*/       LOOP / CIVI integration pages
    favorites/            Saved tools
    history/               Recent activity
src/
  config/env.ts          Environment schema — every var optional
  registry/               Tool registry, quick-answers engine, app registry
  lib/ai/                 AI provider architecture
  lib/image/               Image-generation provider architecture
  lib/workspace/          History + favorites (localStorage, Supabase-ready)
  lib/pdf/                Client-side PDF text extraction
  components/              Shell, command palette, design system primitives
```

## Provider architecture

Both `lib/ai` and `lib/image` follow the same shape: a typed `Provider`
interface, one implementation per vendor, and a factory
(`getProvider()`) that picks the first configured vendor from environment
variables. With nothing configured, `getProvider()` returns a `NullProvider`
that reports `configured: false` — callers must check this and show an
honest "connect a provider" state instead of inventing output.

## Zero Degree app registry

`src/registry/apps.ts` lists the Zero Degree product family. Each entry's
`url` comes from an environment variable (`NEXT_PUBLIC_ZHUB_URL`,
`NEXT_PUBLIC_LOOP_URL`, `NEXT_PUBLIC_CIVI_URL`); an app shows as
"not connected" until its URL is set — ORBIT never hardcodes another
product's address.
