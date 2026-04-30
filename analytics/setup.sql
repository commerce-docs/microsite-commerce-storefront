-- =============================================================================
-- Custom Analytics — Supabase Setup
-- =============================================================================
-- Run this entire file in the Supabase SQL Editor once, after creating your
-- free project at https://supabase.com. Copy the Project URL and anon key
-- from Project Settings > API and add them to your .env file.
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 1. Tables
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS page_views (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id       TEXT        NOT NULL,
  visitor_id       TEXT        NOT NULL,
  url              TEXT        NOT NULL,
  referrer         TEXT,
  title            TEXT,
  timestamp        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  duration_seconds INTEGER,
  is_bounce        BOOLEAN     DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_pv_timestamp  ON page_views (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_pv_url        ON page_views (url);
CREATE INDEX IF NOT EXISTS idx_pv_session    ON page_views (session_id);
CREATE INDEX IF NOT EXISTS idx_pv_visitor    ON page_views (visitor_id);


CREATE TABLE IF NOT EXISTS events (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id   TEXT        NOT NULL,
  visitor_id   TEXT        NOT NULL,
  url          TEXT        NOT NULL,
  event_type   TEXT        NOT NULL,   -- click | scroll | form | custom
  event_name   TEXT,
  event_data   JSONB,
  timestamp    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ev_timestamp ON events (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ev_type      ON events (event_type);


-- ---------------------------------------------------------------------------
-- 2. Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE events     ENABLE ROW LEVEL SECURITY;

-- Tracking script inserts page views and later patches duration/bounce
CREATE POLICY "anon_insert_page_views" ON page_views
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_update_page_views" ON page_views
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "anon_select_page_views" ON page_views
  FOR SELECT TO anon USING (true);

-- Tracking script inserts events
CREATE POLICY "anon_insert_events" ON events
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_select_events" ON events
  FOR SELECT TO anon USING (true);


-- ---------------------------------------------------------------------------
-- 3. Aggregation Views
-- ---------------------------------------------------------------------------

-- Daily summary — used for the trend chart and summary card totals
CREATE OR REPLACE VIEW analytics_summary AS
SELECT
  (timestamp::DATE)                                              AS day,
  COUNT(DISTINCT session_id)                                     AS visits,
  COUNT(*)                                                       AS page_views,
  COUNT(DISTINCT visitor_id)                                     AS unique_visitors,
  COALESCE(
    ROUND(AVG(duration_seconds)::NUMERIC, 0), 0
  )::INTEGER                                                     AS avg_duration_seconds,
  COALESCE(
    ROUND(
      100.0
        * COUNT(*) FILTER (WHERE is_bounce = TRUE)
        / NULLIF(COUNT(DISTINCT session_id), 0),
      1
    ),
    0
  )                                                              AS bounce_rate_pct
FROM page_views
GROUP BY timestamp::DATE
ORDER BY day DESC;


-- Top pages by view count
CREATE OR REPLACE VIEW top_pages AS
SELECT
  url,
  COUNT(*)                                                       AS page_views,
  COUNT(DISTINCT visitor_id)                                     AS unique_visitors,
  COALESCE(
    ROUND(AVG(duration_seconds)::NUMERIC, 0), 0
  )::INTEGER                                                     AS avg_duration_seconds
FROM page_views
GROUP BY url
ORDER BY page_views DESC
LIMIT 50;


-- 30-day totals for summary cards — accurate unique counts across the window
CREATE OR REPLACE VIEW analytics_totals_30d AS
SELECT
  COUNT(DISTINCT session_id)                                     AS visits,
  COUNT(*)                                                       AS page_views,
  COUNT(DISTINCT visitor_id)                                     AS unique_visitors,
  COALESCE(
    ROUND(AVG(duration_seconds)::NUMERIC, 0), 0
  )::INTEGER                                                     AS avg_duration_seconds,
  COALESCE(
    ROUND(
      100.0
        * COUNT(*) FILTER (WHERE is_bounce = TRUE)
        / NULLIF(COUNT(DISTINCT session_id), 0),
      1
    ),
    0
  )                                                              AS bounce_rate_pct
FROM page_views
WHERE timestamp >= NOW() - INTERVAL '30 days';


-- Event breakdown by type and name
CREATE OR REPLACE VIEW events_summary AS
SELECT
  event_type,
  event_name,
  COUNT(*) AS event_count
FROM events
GROUP BY event_type, event_name
ORDER BY event_count DESC;


-- ---------------------------------------------------------------------------
-- 4. Grant SELECT on views to the anon role
-- ---------------------------------------------------------------------------

GRANT SELECT ON analytics_summary    TO anon;
GRANT SELECT ON analytics_totals_30d TO anon;
GRANT SELECT ON top_pages            TO anon;
GRANT SELECT ON events_summary       TO anon;
