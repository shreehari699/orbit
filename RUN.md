# Running ORBIT locally

You don't need any special setup to try ORBIT — most of it works with
zero configuration.

## 1. Extract the ZIP

Unzip it anywhere on your computer (e.g. your Desktop).

## 2. Open the folder in VS Code

Open VS Code → **File → Open Folder…** → select the extracted `orbit`
folder.

## 3. Open a terminal

**Terminal → New Terminal** (top menu bar).

## 4. Install dependencies

```
npm install
```

This will take a minute or two the first time.

> This project was originally built with [pnpm](https://pnpm.io) (see
> `pnpm-lock.yaml`), but plain `npm install` works fine too — it just
> ignores that lockfile and resolves its own. If you have pnpm
> installed, `pnpm install` is a little faster.

## 5. Create your local environment file

```
cp .env.example .env.local
```

On Windows (Command Prompt):

```
copy .env.example .env.local
```

## 6. (Optional) Add environment variables

Open the new `.env.local` file. **Every value in it is optional** —
ORBIT's Command Center, search, and 25+ utility tools (converters,
JSON formatter, image tools, PDF merge/split/compress, etc.) all work
with nothing filled in at all. Fill in only what you want to turn on:

| Variable | Turns on |
|---|---|
| `GEMINI_API_KEY` | Grammar Checker, Rewriter, Summarizer, Tone Changer, Email Writer, Paraphraser, PDF Intelligence's AI summary/Q&A, and the ORBIT AI Assistant |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | Cross-device sync (not required to use any tool) — see `supabase/README.md` before setting these |
| `BRAVE_SEARCH_API_KEY` or `SERPER_API_KEY` | Live "Web" results on the Search page |
| `OPENAI_IMAGE_API_KEY` / `STABILITY_API_KEY` | Image generation |
| `NEXT_PUBLIC_ZHUB_URL` / `NEXT_PUBLIC_LOOP_URL` / `NEXT_PUBLIC_CIVI_URL` | Links to sibling Zero Degree apps in the app switcher |

Whatever you leave blank just shows an honest "not configured" message
in the app instead of an error — nothing breaks.

## 7. Start the app

```
npm run dev
```

## 8. Open it in your browser

Go to **http://localhost:3000**

---

## Everyday use after the first setup

Once you've done steps 4–6 once, you only need steps 7–8 next time:
open a terminal in the folder and run `npm run dev`.

## If something goes wrong

- **Port already in use** — something else is using port 3000. Run
  `npm run dev -- -p 3001` and open `http://localhost:3001` instead.
- **A tool page shows a blank/red error** — run `npm install` again to
  make sure everything installed correctly, then restart `npm run dev`.
- **"Not configured" message on an AI tool** — that's expected until
  you add the matching key from the table above to `.env.local` and
  restart `npm run dev`.
