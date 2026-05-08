-- ---------------------------------------------------------------------------
-- 3. Aggregation Views
-- ---------------------------------------------------------------------------

-- Daily summary — used for the trend chart and summary card totals
-- Bounce rate = share of sessions that had exactly one page view that day
-- (not per-page is_bounce flags, which would exceed 100% for multi-page sessions)
-- Use BIGINT for counts so CREATE OR REPLACE VIEW matches prior column types (SUM() is numeric by default).
CREATE OR REPLACE VIEW analytics_summary
WITH (security_invoker = true) AS
WITH session_day AS (
  SELECT
    session_id,
    (timestamp::DATE) AS day,
    COUNT(*) AS pv_count
  FROM page_views
  GROUP BY session_id, (timestamp::DATE)
),
day_sessions AS (
  SELECT
    day,
    COUNT(*)::BIGINT AS visits,
    SUM(pv_count)::BIGINT AS page_views,
    COUNT(*) FILTER (WHERE pv_count = 1)::BIGINT AS bounced_sessions
  FROM session_day
  GROUP BY day
),
unique_per_day AS (
  SELECT
    (timestamp::DATE) AS day,
    COUNT(DISTINCT visitor_id) AS unique_visitors
  FROM page_views
  GROUP BY (timestamp::DATE)
),
duration_per_day AS (
  SELECT
    (timestamp::DATE) AS day,
    AVG(duration_seconds)::NUMERIC AS avg_duration_seconds
  FROM page_views
  WHERE duration_seconds IS NOT NULL
  GROUP BY (timestamp::DATE)
)
SELECT
  ds.day,
  ds.visits,
  ds.page_views,
  COALESCE(upd.unique_visitors, 0)::BIGINT AS unique_visitors,
  COALESCE(
    ROUND(dpd.avg_duration_seconds, 0),
    0
  )::INTEGER AS avg_duration_seconds,
  COALESCE(
    ROUND(
      100.0 * ds.bounced_sessions::NUMERIC / NULLIF(ds.visits, 0),
      1
    ),
    0
  ) AS bounce_rate_pct
FROM day_sessions ds
LEFT JOIN unique_per_day upd ON upd.day = ds.day
LEFT JOIN duration_per_day dpd ON dpd.day = ds.day
ORDER BY ds.day DESC;


-- Top pages by view count
CREATE OR REPLACE VIEW top_pages
WITH (security_invoker = true) AS
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


-- 7-day totals (same logic as analytics_totals_30d; used when the dashboard range is 7 days)
CREATE OR REPLACE VIEW analytics_totals_7d
WITH (security_invoker = true) AS
WITH windowed AS (
  SELECT *
  FROM page_views
  WHERE timestamp >= NOW() - INTERVAL '7 days'
),
session_pv AS (
  SELECT session_id, COUNT(*) AS pv_count
  FROM windowed
  GROUP BY session_id
)
SELECT
  (SELECT COUNT(DISTINCT session_id) FROM windowed) AS visits,
  (SELECT COUNT(*) FROM windowed) AS page_views,
  (SELECT COUNT(DISTINCT visitor_id) FROM windowed) AS unique_visitors,
  COALESCE(
    (
      SELECT ROUND(AVG(duration_seconds)::NUMERIC, 0)
      FROM windowed
      WHERE duration_seconds IS NOT NULL
    ),
    0
  )::INTEGER AS avg_duration_seconds,
  COALESCE(
    ROUND(
      100.0
        * (SELECT COUNT(*) FROM session_pv WHERE pv_count = 1)::NUMERIC
        / NULLIF((SELECT COUNT(*) FROM session_pv), 0),
      1
    ),
    0
  ) AS bounce_rate_pct;


-- 30-day totals for summary cards — accurate unique counts across the window
-- Bounce rate = sessions with exactly one page view in the window / all sessions
CREATE OR REPLACE VIEW analytics_totals_30d
WITH (security_invoker = true) AS
WITH windowed AS (
  SELECT *
  FROM page_views
  WHERE timestamp >= NOW() - INTERVAL '30 days'
),
session_pv AS (
  SELECT session_id, COUNT(*) AS pv_count
  FROM windowed
  GROUP BY session_id
)
SELECT
  (SELECT COUNT(DISTINCT session_id) FROM windowed) AS visits,
  (SELECT COUNT(*) FROM windowed) AS page_views,
  (SELECT COUNT(DISTINCT visitor_id) FROM windowed) AS unique_visitors,
  COALESCE(
    (
      SELECT ROUND(AVG(duration_seconds)::NUMERIC, 0)
      FROM windowed
      WHERE duration_seconds IS NOT NULL
    ),
    0
  )::INTEGER AS avg_duration_seconds,
  COALESCE(
    ROUND(
      100.0
        * (SELECT COUNT(*) FROM session_pv WHERE pv_count = 1)::NUMERIC
        / NULLIF((SELECT COUNT(*) FROM session_pv), 0),
      1
    ),
    0
  ) AS bounce_rate_pct;


-- 90-day totals (same logic as analytics_totals_30d; used when the dashboard range is 90 days)
CREATE OR REPLACE VIEW analytics_totals_90d
WITH (security_invoker = true) AS
WITH windowed AS (
  SELECT *
  FROM page_views
  WHERE timestamp >= NOW() - INTERVAL '90 days'
),
session_pv AS (
  SELECT session_id, COUNT(*) AS pv_count
  FROM windowed
  GROUP BY session_id
)
SELECT
  (SELECT COUNT(DISTINCT session_id) FROM windowed) AS visits,
  (SELECT COUNT(*) FROM windowed) AS page_views,
  (SELECT COUNT(DISTINCT visitor_id) FROM windowed) AS unique_visitors,
  COALESCE(
    (
      SELECT ROUND(AVG(duration_seconds)::NUMERIC, 0)
      FROM windowed
      WHERE duration_seconds IS NOT NULL
    ),
    0
  )::INTEGER AS avg_duration_seconds,
  COALESCE(
    ROUND(
      100.0
        * (SELECT COUNT(*) FROM session_pv WHERE pv_count = 1)::NUMERIC
        / NULLIF((SELECT COUNT(*) FROM session_pv), 0),
      1
    ),
    0
  ) AS bounce_rate_pct;


-- 365-day totals (same logic; used when the dashboard range is one year)
CREATE OR REPLACE VIEW analytics_totals_365d
WITH (security_invoker = true) AS
WITH windowed AS (
  SELECT *
  FROM page_views
  WHERE timestamp >= NOW() - INTERVAL '365 days'
),
session_pv AS (
  SELECT session_id, COUNT(*) AS pv_count
  FROM windowed
  GROUP BY session_id
)
SELECT
  (SELECT COUNT(DISTINCT session_id) FROM windowed) AS visits,
  (SELECT COUNT(*) FROM windowed) AS page_views,
  (SELECT COUNT(DISTINCT visitor_id) FROM windowed) AS unique_visitors,
  COALESCE(
    (
      SELECT ROUND(AVG(duration_seconds)::NUMERIC, 0)
      FROM windowed
      WHERE duration_seconds IS NOT NULL
    ),
    0
  )::INTEGER AS avg_duration_seconds,
  COALESCE(
    ROUND(
      100.0
        * (SELECT COUNT(*) FROM session_pv WHERE pv_count = 1)::NUMERIC
        / NULLIF((SELECT COUNT(*) FROM session_pv), 0),
      1
    ),
    0
  ) AS bounce_rate_pct;


-- Event breakdown by type and name (excludes outcome, external_link, and legacy web_vital rows)
CREATE OR REPLACE VIEW events_summary
WITH (security_invoker = true) AS
SELECT
  event_type,
  event_name,
  COUNT(*) AS event_count
FROM events
WHERE event_type NOT IN ('web_vital', 'outcome', 'external_link')
GROUP BY event_type, event_name
ORDER BY event_count DESC;


-- Engagement depth (last 7 days) — same shape as management_engagement_30d
CREATE OR REPLACE VIEW management_engagement_7d
WITH (security_invoker = true) AS
SELECT
  COALESCE(
    (
      SELECT ROUND(AVG(cnt)::numeric, 2)
      FROM (
        SELECT session_id, COUNT(*)::bigint AS cnt
        FROM page_views
        WHERE timestamp >= NOW() - INTERVAL '7 days'
        GROUP BY session_id
      ) q
    ),
    0
  ) AS avg_pages_per_session,
  COALESCE(
    (
      SELECT COUNT(*)::bigint
      FROM (
        SELECT session_id
        FROM page_views
        WHERE timestamp >= NOW() - INTERVAL '7 days'
        GROUP BY session_id
        HAVING COUNT(*) >= 2
      ) m
    ),
    0
  ) AS sessions_with_2plus_pages,
  COALESCE(
    (
      SELECT COUNT(DISTINCT session_id)::bigint
      FROM page_views
      WHERE timestamp >= NOW() - INTERVAL '7 days'
    ),
    0
  ) AS sessions_total,
  COALESCE(
    (
      SELECT COUNT(*)::bigint
      FROM (
        SELECT visitor_id
        FROM page_views
        WHERE timestamp >= NOW() - INTERVAL '7 days'
        GROUP BY visitor_id
        HAVING COUNT(DISTINCT session_id) > 1
      ) r
    ),
    0
  ) AS returning_visitors,
  COALESCE(
    (
      SELECT COUNT(DISTINCT visitor_id)::bigint
      FROM page_views
      WHERE timestamp >= NOW() - INTERVAL '7 days'
    ),
    0
  ) AS unique_visitors_30d;


-- Engagement depth (last 30 days): pages per session and returning visitors
CREATE OR REPLACE VIEW management_engagement_30d
WITH (security_invoker = true) AS
SELECT
  COALESCE(
    (
      SELECT ROUND(AVG(cnt)::numeric, 2)
      FROM (
        SELECT session_id, COUNT(*)::bigint AS cnt
        FROM page_views
        WHERE timestamp >= NOW() - INTERVAL '30 days'
        GROUP BY session_id
      ) q
    ),
    0
  ) AS avg_pages_per_session,
  COALESCE(
    (
      SELECT COUNT(*)::bigint
      FROM (
        SELECT session_id
        FROM page_views
        WHERE timestamp >= NOW() - INTERVAL '30 days'
        GROUP BY session_id
        HAVING COUNT(*) >= 2
      ) m
    ),
    0
  ) AS sessions_with_2plus_pages,
  COALESCE(
    (
      SELECT COUNT(DISTINCT session_id)::bigint
      FROM page_views
      WHERE timestamp >= NOW() - INTERVAL '30 days'
    ),
    0
  ) AS sessions_total,
  COALESCE(
    (
      SELECT COUNT(*)::bigint
      FROM (
        SELECT visitor_id
        FROM page_views
        WHERE timestamp >= NOW() - INTERVAL '30 days'
        GROUP BY visitor_id
        HAVING COUNT(DISTINCT session_id) > 1
      ) r
    ),
    0
  ) AS returning_visitors,
  COALESCE(
    (
      SELECT COUNT(DISTINCT visitor_id)::bigint
      FROM page_views
      WHERE timestamp >= NOW() - INTERVAL '30 days'
    ),
    0
  ) AS unique_visitors_30d;


-- Engagement depth (last 90 days) — same shape as management_engagement_30d
CREATE OR REPLACE VIEW management_engagement_90d
WITH (security_invoker = true) AS
SELECT
  COALESCE(
    (
      SELECT ROUND(AVG(cnt)::numeric, 2)
      FROM (
        SELECT session_id, COUNT(*)::bigint AS cnt
        FROM page_views
        WHERE timestamp >= NOW() - INTERVAL '90 days'
        GROUP BY session_id
      ) q
    ),
    0
  ) AS avg_pages_per_session,
  COALESCE(
    (
      SELECT COUNT(*)::bigint
      FROM (
        SELECT session_id
        FROM page_views
        WHERE timestamp >= NOW() - INTERVAL '90 days'
        GROUP BY session_id
        HAVING COUNT(*) >= 2
      ) m
    ),
    0
  ) AS sessions_with_2plus_pages,
  COALESCE(
    (
      SELECT COUNT(DISTINCT session_id)::bigint
      FROM page_views
      WHERE timestamp >= NOW() - INTERVAL '90 days'
    ),
    0
  ) AS sessions_total,
  COALESCE(
    (
      SELECT COUNT(*)::bigint
      FROM (
        SELECT visitor_id
        FROM page_views
        WHERE timestamp >= NOW() - INTERVAL '90 days'
        GROUP BY visitor_id
        HAVING COUNT(DISTINCT session_id) > 1
      ) r
    ),
    0
  ) AS returning_visitors,
  COALESCE(
    (
      SELECT COUNT(DISTINCT visitor_id)::bigint
      FROM page_views
      WHERE timestamp >= NOW() - INTERVAL '90 days'
    ),
    0
  ) AS unique_visitors_30d;


-- Engagement depth (last 365 days) — same shape as management_engagement_30d
CREATE OR REPLACE VIEW management_engagement_365d
WITH (security_invoker = true) AS
SELECT
  COALESCE(
    (
      SELECT ROUND(AVG(cnt)::numeric, 2)
      FROM (
        SELECT session_id, COUNT(*)::bigint AS cnt
        FROM page_views
        WHERE timestamp >= NOW() - INTERVAL '365 days'
        GROUP BY session_id
      ) q
    ),
    0
  ) AS avg_pages_per_session,
  COALESCE(
    (
      SELECT COUNT(*)::bigint
      FROM (
        SELECT session_id
        FROM page_views
        WHERE timestamp >= NOW() - INTERVAL '365 days'
        GROUP BY session_id
        HAVING COUNT(*) >= 2
      ) m
    ),
    0
  ) AS sessions_with_2plus_pages,
  COALESCE(
    (
      SELECT COUNT(DISTINCT session_id)::bigint
      FROM page_views
      WHERE timestamp >= NOW() - INTERVAL '365 days'
    ),
    0
  ) AS sessions_total,
  COALESCE(
    (
      SELECT COUNT(*)::bigint
      FROM (
        SELECT visitor_id
        FROM page_views
        WHERE timestamp >= NOW() - INTERVAL '365 days'
        GROUP BY visitor_id
        HAVING COUNT(DISTINCT session_id) > 1
      ) r
    ),
    0
  ) AS returning_visitors,
  COALESCE(
    (
      SELECT COUNT(DISTINCT visitor_id)::bigint
      FROM page_views
      WHERE timestamp >= NOW() - INTERVAL '365 days'
    ),
    0
  ) AS unique_visitors_30d;


-- High-value outbound clicks (legacy outcome events), last 30 days
CREATE OR REPLACE VIEW outcome_clicks_30d
WITH (security_invoker = true) AS
SELECT
  event_name AS outcome_key,
  MAX(event_data->>'category') AS category,
  COUNT(*)::bigint AS clicks
FROM events
WHERE event_type = 'outcome'
  AND timestamp >= NOW() - INTERVAL '30 days'
GROUP BY event_name
ORDER BY clicks DESC;


-- External link clicks by destination URL, last 7 days
CREATE OR REPLACE VIEW public.external_link_clicks_7d
WITH (security_invoker = true) AS
SELECT
  event_data->>'href' AS href,
  COUNT(*)::bigint AS clicks
FROM events
WHERE event_type = 'external_link'
  AND timestamp >= NOW() - INTERVAL '7 days'
  AND COALESCE(NULLIF(TRIM(event_data->>'href'), ''), '') <> ''
GROUP BY event_data->>'href'
ORDER BY clicks DESC
LIMIT 100;


-- External link clicks by destination URL, last 30 days (one row per href)
CREATE OR REPLACE VIEW public.external_link_clicks_30d
WITH (security_invoker = true) AS
SELECT
  event_data->>'href' AS href,
  COUNT(*)::bigint AS clicks
FROM events
WHERE event_type = 'external_link'
  AND timestamp >= NOW() - INTERVAL '30 days'
  AND COALESCE(NULLIF(TRIM(event_data->>'href'), ''), '') <> ''
GROUP BY event_data->>'href'
ORDER BY clicks DESC
LIMIT 100;


-- External link clicks by destination URL, last 90 days
CREATE OR REPLACE VIEW public.external_link_clicks_90d
WITH (security_invoker = true) AS
SELECT
  event_data->>'href' AS href,
  COUNT(*)::bigint AS clicks
FROM events
WHERE event_type = 'external_link'
  AND timestamp >= NOW() - INTERVAL '90 days'
  AND COALESCE(NULLIF(TRIM(event_data->>'href'), ''), '') <> ''
GROUP BY event_data->>'href'
ORDER BY clicks DESC
LIMIT 100;


-- External link clicks by destination URL, last 365 days
CREATE OR REPLACE VIEW public.external_link_clicks_365d
WITH (security_invoker = true) AS
SELECT
  event_data->>'href' AS href,
  COUNT(*)::bigint AS clicks
FROM events
WHERE event_type = 'external_link'
  AND timestamp >= NOW() - INTERVAL '365 days'
  AND COALESCE(NULLIF(TRIM(event_data->>'href'), ''), '') <> ''
GROUP BY event_data->>'href'
ORDER BY clicks DESC
LIMIT 100;