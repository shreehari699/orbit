# From ORBIT the web app to ORBIT the browser

ORBIT today is a Next.js web application: a Command Center, universal
search, a growing tool registry, PDF Intelligence, and links out to the
Zero Degree app family. This document is the honest map from that web
app to a future **ORBIT Browser** — a Chromium-based desktop browser
with ORBIT's workspace built in rather than bolted on as an extension.

It is a roadmap, not an implementation. No browser-engine code, no
Chromium source, and no Electron/CEF scaffolding exists in this
repository, and none should be added under this phase of work — see
"Why not now" below.

## Why not now

Building a browser is a different kind of project from building a web
app:

- It means embedding and maintaining a Chromium fork (via Electron, CEF,
  or a raw Chromium Embedded build) — a multi-gigabyte toolchain with its
  own release cadence, security patch cycle, and platform-specific build
  pipeline (Windows/macOS/Linux separately).
- It means owning browser-grade security surface: process sandboxing,
  site isolation, certificate handling, extension permissions — mistakes
  here are a different severity class than a bug in a web tool.
- It means a native app distribution story (code signing, auto-update,
  OS-level installers) that a Next.js deployment doesn't need at all.

None of that is compatible with "build it inside the current Next.js
repository" — a browser shell is not a page you route to. It is its own
codebase, with ORBIT's web app embedded inside it as one of its surfaces
(likely the browser's default new-tab page and a set of internal
`orbit://` pages), not the other way around. Pulling Chromium or Brave
source into this repo now, as the earlier spec draft floated and
explicitly ruled out, would produce an unbuildable mess: two entirely
different build systems (Next.js's and Chromium's) with no coherent
relationship.

## What ORBIT the web app is building toward

The current architecture is deliberately shaped so today's web app
becomes tomorrow's browser's built-in workspace with minimal rework:

- **The tool registry (`src/registry/tools.ts`) is UI-agnostic.** It is
  already just data — id, label, route, category, keywords. A future
  `orbit://tools` page inside the browser shell can render the exact same
  registry.
- **The provider architectures (`src/lib/ai`, `src/lib/image`,
  `src/lib/websearch`) never assume a specific runtime.** They are plain
  TypeScript modules built on `fetch`; they will run identically whether
  the surrounding shell is `next start` or an embedded browser's internal
  renderer.
- **Workspace state (`src/lib/workspace/*`) already separates local
  storage from a sync backend** (the unapplied Supabase schema in
  `supabase/`). A browser needs history/bookmarks/downloads to work
  offline-first with optional sync — the same shape ORBIT's favorites and
  history already use.
- **ORBIT Search's deterministic-first design (quick answers before any
  network call) is exactly what an address bar needs** — instant local
  answers for math/units/tool navigation, falling through to web search
  only when nothing local matches.

## The actual future architecture (when this phase is greenlit)

```
orbit-browser/                  ← a new, separate repository/build target
  chromium-shell/                ← Electron or CEF embedding of Chromium
    main process                 ← window management, tabs, address bar,
                                    downloads, bookmarks, extension host
    preload/IPC bridge            ← exposes a narrow, audited API surface
                                    to embedded ORBIT web content
  orbit-webapp/                  ← THIS repository, embedded as:
    - the new-tab / home surface  (Command Center)
    - orbit:// internal pages     (Search, Tools, Favorites, History,
                                    Settings, Zero Degree app switcher)
    - unchanged as a normal website too — orbit.zerodegree.* keeps
      working in any browser, not just this one
```

Concretely, in rough sequence, once this phase starts:

1. **Address bar → ORBIT Search.** Non-URL input in the browser's address
   bar routes through the same deterministic-first search this repo
   already implements (quick answers → tool registry → resources index →
   web search provider), rather than reimplementing search logic in the
   shell.
2. **Tabs, history, bookmarks, downloads** as native browser chrome,
   backed by the same Supabase schema this repo already defines for
   cross-device sync (extended with `bookmarks` and `browser_sessions`
   tables) — so a signed-in user's ORBIT workspace and browser history
   are the same account, not two separate products.
3. **`orbit://` internal pages** render this Next.js app's routes
   (statically exported or served from a local process) inside the
   browser shell's own tabs — Command Center becomes the default
   new-tab page, PDF Intelligence becomes the browser's built-in PDF
   viewer, etc.
4. **Extensions and privacy controls** (tracker blocking, permission
   prompts) — the parts of a browser most security-sensitive and least
   related to anything in this repository; scoped and staffed
   separately when this phase is actually greenlit.
5. **LOOP and CIVI as first-class browser surfaces**, not just links —
   e.g. a persistent sidebar or a keyboard shortcut that opens LOOP/CIVI
   in a docked panel, once both products have stable public URLs (see
   `src/registry/apps.ts` — both are `null` today; ORBIT never fabricates
   a URL for them).

## What would trigger starting this

This roadmap is intentionally not scheduled. Reasonable triggers, in the
maintainers' judgment, might include: the web app's tool registry and
provider architecture reaching a state stable enough to embed without
constant breaking changes; Zero Degree deciding a native distribution
channel matters more than reaching users through their existing browser;
and dedicated engineering capacity for the Chromium-embedding work
described above, separate from whoever is iterating on the web app.
None of those conditions exist yet as of this document.
