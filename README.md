# Reaction Rush

A fast, polished reaction-time test — the first game in a browser-games
platform built to grow. **Quick games. Real scores. Can you beat yours?**

## What's here

- **Quick Test** — one reaction round, personal best saved locally.
- **5 Round Challenge** — five rounds, average + best, no valid score lost to
  a false start (a false start restarts that round).
- **Daily Challenge** — a target that changes by day of week, tracked per
  local calendar day.
- **Personal best** — stored in `localStorage`, no account needed.
- **Share / Challenge a friend** — Web Share API with a copy-to-clipboard
  fallback, plus a `/challenge/[ms]` landing page recipients can play from
  immediately.
- **Leaderboard** — demo data out of the box, clearly labeled as such, with a
  documented seam to plug in a real Supabase backend (`lib/leaderboard.ts`,
  `supabase/schema.sql`).
- **SEO** — landing page copy, FAQ with JSON-LD, `sitemap.xml`, `robots.txt`, Organization/WebSite structured data, and dynamic Open Graph share images (see below).
- **Player stats dashboard** (`/stats`) — reaction time trend, 5-Round Challenge session averages, a "where your scores land" distribution chart, and for Impossible Color: accuracy trend and average correct-response time. All computed from a local history log; nothing leaves the device.
- **Analytics** — Vercel Analytics + Speed Insights (zero-config), with optional Google Analytics 4 support.
- **Accessibility** — keyboard (spacebar) support, visible focus states,
  semantic buttons, state communicated in text (not color alone), and
  `prefers-reduced-motion` respected.
- **Analytics hooks** — `lib/analytics.ts` logs events in dev and forwards to
  Google Analytics if `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set. No PII
  collected.

## Project structure

```
app/
  page.tsx                 Homepage (hero, game grid, SEO copy, FAQ)
  reaction/                Quick Test + 5 Round Challenge
  daily/                   Daily Challenge
  leaderboard/             Leaderboard page (demo or live)
  challenge/[ms]/          Shareable "beat this score" landing page
  about/ privacy/ terms/   Trust pages
  sitemap.ts robots.ts     SEO plumbing
components/
  GameNavigation, GameCard, ReactionStage, ScoreDisplay, PersonalBest,
  ShareButton, ResultCard — reusable across future games
games/reaction/
  useReactionRound.ts       Core timing/state engine for reaction-based games
lib/
  timing.ts scoring.ts storage.ts analytics.ts leaderboard.ts player.ts sound.ts
config/
  game.ts                   All tunable numbers: wait range, round count,
                             score thresholds, daily targets
supabase/
  schema.sql                Leaderboard table + RLS policy, ready to run
```

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Build & deploy

```bash
npm run build
npm run start
```

Deploys cleanly to Vercel (recommended — zero config for Next.js App Router)
or any Node host that supports Next.js. No environment variables are
required to run with demo data.

## Environment variables

Copy `.env.example` to `.env.local` and fill in only what you're using:

| Variable | Required? | Purpose |
|---|---|---|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | No | Forwards analytics events to Google Analytics. Omit to just log events in dev. |
| `NEXT_PUBLIC_SUPABASE_URL` | No | Enables the live leaderboard path in `lib/leaderboard.ts`. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Client-side Supabase key for reads. |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Server-side key for a submission route (see below). Never expose this to the client. |

## Growth & analytics tools

**Vercel Analytics + Speed Insights** — enabled automatically, no environment
variables needed. Once deployed, go to your project on vercel.com and open
the **Analytics** and **Speed Insights** tabs to see real visitor counts,
top pages, and Core Web Vitals. (Analytics on the free/Hobby plan shows a
rolling window of data; Speed Insights works on all plans.)

**Google Analytics 4 (optional)** — set `NEXT_PUBLIC_GA_MEASUREMENT_ID` in
Vercel's environment variables and redeploy. The `gtag.js` script now loads
automatically when that variable is present (previously the code referenced
`gtag` but never loaded the script, so GA silently did nothing — this is
fixed). All the events listed in "What's here" above forward to GA once
enabled.

**Dynamic Open Graph share images** — every `/challenge/[ms]` link now
generates a real branded image showing the actual score, label ("Very
fast", "Lightning fast", etc.), and a "Can you beat it?" call to action.
This is what shows up when a challenge link is pasted into iMessage,
Slack, Twitter/X, or Facebook — previously these links had no preview
image at all. Test how a link will look before sharing widely using
Twitter's [Card Validator](https://cards-dev.twitter.com/validator) or
Facebook's [Sharing Debugger](https://developers.facebook.com/tools/debug/).
The homepage has its own static share image at `/opengraph-image`.

**Structured data** — the root layout now includes `WebSite` schema (in
addition to the homepage's existing FAQ schema), which helps Google
understand the site and can enable a sitelinks search box in results.



1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor. It creates a `scores` table
   with a check constraint on plausible reaction times (80–3000ms), enables
   Row Level Security, and grants public **read** access only.
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Implement `fetchLeaderboardFromBackend` in `lib/leaderboard.ts` using the
   Supabase JS client to `select` from `scores`.
5. For **submissions**, don't insert directly from the browser. Add a small
   server route (a Next.js Route Handler works well) that:
   - validates `score_ms` is in a plausible human range,
   - rate-limits by the anonymous `player_id` (e.g. one submission per few
     seconds),
   - sanitizes any `display_name` (strip HTML, cap length),
   - then inserts using the service role key.
   Point `submitScoreToBackend` at that route.

Until this is wired up, the leaderboard page shows clearly-labeled demo data
and never claims to be live.

## Adding the second game

The architecture is built so a new game is a new route plus reused
components, not a rewrite:

1. Add `games/<name>/` for game-specific logic (a hook like
   `useReactionRound.ts`, adapted to the new game's rules).
2. Add `app/<name>/page.tsx` (+ a client component if it needs interactivity)
   using `ReactionStage`-style stage components, or new ones that follow the
   same pattern.
3. Reuse `ScoreDisplay`, `PersonalBest`, `ShareButton`, `ResultCard`,
   `GameNavigation` as-is.
4. Add the new game's tunable numbers to `config/game.ts` (or a sibling
   config file) rather than hardcoding them.
5. Update the homepage's game grid in `app/page.tsx` — move it from
   "Coming soon" to a real `href`.
6. Add the new route to `app/sitemap.ts`.

## Recommended next improvements

- Wire up the Supabase leaderboard and a rate-limited submission route.
- Add a lightweight CAPTCHA-free anti-bot signal (e.g. requiring a valid
  session token minted server-side at game start) before accepting
  leaderboard submissions.
- Add the second game (Memory Challenge is a natural next pick — it reuses
  `ResultCard`/`ShareButton`/`PersonalBest` almost unchanged).
- Add real ad slots (reserved, clearly separated from gameplay) once traffic
  justifies it — placeholders are already accounted for in the layout
  structure below the game.
- Consider a lightweight consent banner if/when analytics or ads require it
  in your users' regions.
