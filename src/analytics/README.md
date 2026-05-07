# Site analytics (Supabase)

This folder holds everything for the optional docs-site analytics dashboard (traffic, outcomes, and engagement).

| File | Role |
|------|------|
| `setup.sql` | Run once in the Supabase SQL Editor (tables, RLS, views, grants). |
| `tracker.ts` | Injected on every page from `astro.config.mjs` — records page views, events, and active (foreground-tab) dwell time. |
| `Dashboard.tsx` | React UI for `/analytics/` (loaded from `src/pages/analytics/index.astro`). |

Environment: set `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` in `.env` (see `.env.example`).

Import alias: `@analytics/Dashboard` (see `tsconfig.json`).
