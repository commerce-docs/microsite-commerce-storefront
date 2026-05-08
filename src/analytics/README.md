# Site analytics (Supabase)

This folder holds everything for the optional docs-site analytics dashboard (traffic, outcomes, and engagement).

| File | Role |
|------|------|
| `setup.sql` | Run in the Supabase SQL Editor (tables, RLS, views, grants). Re-run when this file adds views (for example `analytics_totals_7d`, `analytics_totals_90d` / `analytics_totals_365d`, matching `management_engagement_*` and `external_link_clicks_*` views for each dashboard date range). |
| `tracker.ts` | Injected on every page from `astro.config.mjs` — records page views, events, and active (foreground-tab) dwell time. |
| `Dashboard.tsx` | React UI for `/analytics/` (loaded from `src/pages/analytics/index.astro`). |

Environment: set `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` in your `.env` file (see `.env.example`).

## Date range (7 / 30 / 90 / 365 days)

The dashboard calls separate views for each window (for example `analytics_totals_7d`, `analytics_totals_90d`, `management_engagement_365d`, `external_link_clicks_7d`). If Last 7 days, Last 90 days, or Last 365 days shows a load error but Last 30 days works, your Supabase project is missing those views. Re-run the current `setup.sql` in the SQL Editor (safe to run again; it uses `CREATE OR REPLACE`).

Import alias: `@analytics/Dashboard` (see `tsconfig.json`).
