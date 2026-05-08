import { createClient } from '@supabase/supabase-js';
import { useEffect, useId, useMemo, useState } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DailySummary {
  day: string;
  visits: number;
  page_views: number;
  unique_visitors: number;
  avg_duration_seconds: number;
  bounce_rate_pct: number;
}

interface Totals {
  visits: number;
  page_views: number;
  unique_visitors: number;
  avg_duration_seconds: number;
  bounce_rate_pct: number;
}

interface TopPage {
  url: string;
  page_views: number;
  unique_visitors: number;
  avg_duration_seconds: number;
}

interface EventRow {
  event_type: string;
  event_name: string | null;
  event_count: number;
}

interface EngagementRow {
  avg_pages_per_session: number;
  sessions_with_2plus_pages: number;
  sessions_total: number;
  returning_visitors: number;
  unique_visitors_30d: number;
}

interface ExternalLinkRow {
  href: string;
  clicks: number;
}

type TrendRange = 7 | 30 | 90 | 365;

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL as string,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string
);

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function fmtDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function fmtShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function truncateUrl(url: string, max = 60): string {
  try {
    const u = new URL(url);
    const path = u.pathname + (u.search ? u.search : '');
    return path.length > max ? path.slice(0, max) + '…' : path;
  } catch {
    return url.length > max ? url.slice(0, max) + '…' : url;
  }
}

function truncateHref(url: string, max = 72): string {
  if (url.length <= max) return url;
  return url.slice(0, max) + '…';
}

const TREND_RANGE_OPTIONS: { value: TrendRange; label: string }[] = [
  { value: 7, label: 'Last 7 days' },
  { value: 30, label: 'Last 30 days' },
  { value: 90, label: 'Last 90 days' },
  { value: 365, label: 'Last 365 days' },
];

function totalsViewName(range: TrendRange): string {
  switch (range) {
    case 7:
      return 'analytics_totals_7d';
    case 30:
      return 'analytics_totals_30d';
    case 90:
      return 'analytics_totals_90d';
    case 365:
      return 'analytics_totals_365d';
  }
}

function engagementViewName(range: TrendRange): string {
  switch (range) {
    case 7:
      return 'management_engagement_7d';
    case 30:
      return 'management_engagement_30d';
    case 90:
      return 'management_engagement_90d';
    case 365:
      return 'management_engagement_365d';
  }
}

function externalLinksViewName(range: TrendRange): string {
  switch (range) {
    case 7:
      return 'external_link_clicks_7d';
    case 30:
      return 'external_link_clicks_30d';
    case 90:
      return 'external_link_clicks_90d';
    case 365:
      return 'external_link_clicks_365d';
  }
}

/** UTC `YYYY-MM-DD` for "today" (calendar date in UTC). */
function utcTodayDateString(): string {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()))
    .toISOString()
    .slice(0, 10);
}

/**
 * First UTC calendar date in the chart window (inclusive).
 * The window has `rangeDays` days ending today UTC (same idea as "last N days" on the axis).
 */
function chartWindowStartDate(rangeDays: TrendRange): string {
  const end = new Date(Date.UTC(
    new Date().getUTCFullYear(),
    new Date().getUTCMonth(),
    new Date().getUTCDate()
  ));
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (rangeDays - 1));
  return start.toISOString().slice(0, 10);
}

function normalizeDayKey(day: string): string {
  return day.slice(0, 10);
}

/** One row per UTC calendar day in the window; missing days get zero counts (for a full horizontal axis). */
function padDailyChartSeries(
  rows: DailySummary[],
  rangeDays: TrendRange
): DailySummary[] {
  const startStr = chartWindowStartDate(rangeDays);
  const endStr = utcTodayDateString();

  const byDay = new Map<string, DailySummary>();
  for (const row of rows) {
    byDay.set(normalizeDayKey(row.day), row);
  }

  const emptyDay = (day: string): DailySummary => ({
    day,
    visits: 0,
    page_views: 0,
    unique_visitors: 0,
    avg_duration_seconds: 0,
    bounce_rate_pct: 0,
  });

  const [y0, m0, d0] = startStr.split('-').map(Number);
  const [y1, m1, d1] = endStr.split('-').map(Number);
  const cur = new Date(Date.UTC(y0, m0 - 1, d0));
  const end = new Date(Date.UTC(y1, m1 - 1, d1));
  const out: DailySummary[] = [];
  while (cur.getTime() <= end.getTime()) {
    const key = cur.toISOString().slice(0, 10);
    out.push(byDay.get(key) ?? emptyDay(key));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return out;
}

function isPostgrestLikeError(
  err: unknown
): err is { message: string; details?: string; hint?: string; code?: string } {
  return (
    typeof err === 'object' &&
    err !== null &&
    'message' in err &&
    typeof (err as { message: unknown }).message === 'string'
  );
}

/** Turns Supabase/PostgREST errors into readable text for the error banner. */
function formatAnalyticsLoadError(err: unknown): string {
  if (isPostgrestLikeError(err)) {
    let s = err.message;
    if (err.details) s += ` ${err.details}`;
    if (err.hint) s += ` ${err.hint}`;
    return s;
  }
  if (err instanceof Error) return err.message;
  return 'Failed to load analytics data.';
}

/** True when this index is a strict local maximum (used for highlight dots on page views). */
function isLocalPeak(
  data: DailySummary[],
  index: number,
  key: 'page_views' | 'visits' | 'unique_visitors'
): boolean {
  if (data.length < 3) return false;
  if (index <= 0 || index >= data.length - 1) return false;
  const v = data[index][key];
  const prev = data[index - 1][key];
  const next = data[index + 1][key];
  return v > prev && v > next;
}

/** Site root only (`/` or trailing-slash equivalent) — hides unlabeled hits from the Top pages table. */
function isSiteRootUrl(url: string): boolean {
  try {
    const path = new URL(url).pathname.replace(/\/+$/, '') || '/';
    return path === '/';
  } catch {
    return false;
  }
}

/** Same route rule as tracker.ts — exclude standalone `/analytics` dashboard URLs. */
function isAnalyticsDashboardUrl(url: string): boolean {
  try {
    const path = new URL(url).pathname.replace(/\/+$/, '') || '/';
    return path.endsWith('/analytics');
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionHeader({ title }: { title: string }) {
  return <h2 className="section-header">{title}</h2>;
}

function LoadingPlaceholder({ rows = 3 }: { rows?: number }) {
  return (
    <div className="loading-placeholder">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="loading-row" />
      ))}
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return <p className="error-banner">{message}</p>;
}

function RangeControl({
  value,
  onChange,
  disabled,
}: {
  value: TrendRange;
  onChange: (next: TrendRange) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className="range-control"
      role="group"
      aria-label="Reporting window for summary and daily trend"
    >
      {TREND_RANGE_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={
            'range-control__btn' +
            (value === opt.value ? ' range-control__btn--active' : '')
          }
          aria-pressed={value === opt.value}
          disabled={disabled}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Dashboard
// ---------------------------------------------------------------------------

interface DashboardProps {
  docsHome: string;
}

function AnalyticsSiteHeader({
  docsHome,
  showRange,
  trendRange,
  onTrendRange,
  loading,
}: {
  docsHome: string;
  showRange: boolean;
  trendRange?: TrendRange;
  onTrendRange?: (r: TrendRange) => void;
  loading?: boolean;
}) {
  return (
    <header className="site-header analytics-site-header">
      <div className="analytics-header-inner">
        <div className="analytics-header-group">
          <h1 className="analytics-header-title">Storefront Analytics</h1>
          {showRange && trendRange != null && onTrendRange ? (
            <RangeControl
              value={trendRange}
              onChange={onTrendRange}
              disabled={loading ?? false}
            />
          ) : null}
        </div>
        <a href={docsHome} className="home-link home-link--docs">
          Commerce Storefront Docs
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </header>
  );
}

export default function Dashboard({ docsHome }: DashboardProps) {
  const [trendRange, setTrendRange] = useState<TrendRange>(7);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [chartData, setChartData] = useState<DailySummary[]>([]);
  const [topPages, setTopPages] = useState<TopPage[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [engagement, setEngagement] = useState<EngagementRow | null>(null);
  const [externalLinks, setExternalLinks] = useState<ExternalLinkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const areaGradientId = `dailyPvGrad-${useId().replace(/:/g, '')}`;
  const dailyChartMeta = useMemo(() => {
    const n = chartData.length;
    if (n === 0) return { meanPv: 0, lastDay: null as string | null };
    return {
      meanPv: chartData.reduce((s, d) => s + d.page_views, 0) / n,
      lastDay: chartData[n - 1]?.day ?? null,
    };
  }, [chartData]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [
          totalsRes,
          chartRes,
          pagesRes,
          eventsRes,
          engagementRes,
          externalLinksRes,
        ] = await Promise.all([
          supabase.from(totalsViewName(trendRange)).select('*').single(),
          supabase
            .from('analytics_summary')
            .select('*')
            .gte('day', chartWindowStartDate(trendRange))
            .order('day', { ascending: false })
            .limit(400),
          supabase.from('top_pages').select('*').limit(40),
          supabase.from('events_summary').select('*').limit(30),
          supabase.from(engagementViewName(trendRange)).select('*').single(),
          supabase.from(externalLinksViewName(trendRange)).select('*').limit(100),
        ]);

        if (totalsRes.error) throw totalsRes.error;
        if (chartRes.error) throw chartRes.error;
        if (pagesRes.error) throw pagesRes.error;
        if (eventsRes.error) throw eventsRes.error;
        if (engagementRes.error) throw engagementRes.error;
        if (externalLinksRes.error) throw externalLinksRes.error;

        setTotals(totalsRes.data as Totals);
        setChartData(
          padDailyChartSeries(
            ([...(chartRes.data ?? [])] as DailySummary[]).reverse(),
            trendRange
          )
        );
        const pages = (pagesRes.data ?? []) as TopPage[];
        setTopPages(
          pages
            .filter(
              (p) =>
                !isAnalyticsDashboardUrl(p.url) && !isSiteRootUrl(p.url)
            )
            .slice(0, 20)
        );
        setEvents((eventsRes.data ?? []) as EventRow[]);
        setEngagement(engagementRes.data as EngagementRow);
        setExternalLinks((externalLinksRes.data ?? []) as ExternalLinkRow[]);
      } catch (err) {
        let message = formatAnalyticsLoadError(err);
        if (
          trendRange !== 30 &&
          !message.toLowerCase().includes('setup.sql')
        ) {
          message +=
            ' For 7-, 90-, or 365-day windows, your Supabase project needs the matching views from `src/analytics/setup.sql` (names ending in `_7d`, `_90d`, or `_365d`). Paste the full file into the Supabase SQL Editor, run it, then reload this page.';
        }
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [trendRange]);

  const isConfigured =
    import.meta.env.PUBLIC_SUPABASE_URL &&
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  if (!isConfigured) {
    return (
      <>
        <AnalyticsSiteHeader docsHome={docsHome} showRange={false} />
        <main className="main-content">
          <div className="dashboard-container">
            <p className="setup-notice">
              Storefront Analytics is not configured. Add{' '}
              <code>PUBLIC_SUPABASE_URL</code> and{' '}
              <code>PUBLIC_SUPABASE_ANON_KEY</code> to your{' '}
              <code>.env</code> file, then restart the dev server.
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <AnalyticsSiteHeader
        docsHome={docsHome}
        showRange
        trendRange={trendRange}
        onTrendRange={setTrendRange}
        loading={loading}
      />
      <main className="main-content">
        <div className="dashboard-container">
          <SectionHeader title={`Summary (last ${trendRange} days)`} />

          {loading ? (
            <div className="table-wrapper">
              <table className="data-table data-table--metrics-row">
                <thead>
                  <tr>
                    <th className="num-col">Visits</th>
                    <th className="num-col">Page views</th>
                    <th className="num-col">Unique visitors</th>
                    <th className="num-col">Avg. active time</th>
                    <th className="num-col">Bounce rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <td key={i} className="num-col">
                        <div
                          className="summary-loading-bar"
                          aria-hidden="true"
                        />
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          ) : error ? (
            <ErrorBanner message={error} />
          ) : totals ? (
            <div className="table-wrapper">
              <table className="data-table data-table--metrics-row">
                <thead>
                  <tr>
                    <th className="num-col">Visits</th>
                    <th className="num-col">Page views</th>
                    <th className="num-col">Unique visitors</th>
                    <th className="num-col">Avg. active time</th>
                    <th className="num-col">Bounce rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="num-col">
                      {totals.visits.toLocaleString()}
                    </td>
                    <td className="num-col">
                      {totals.page_views.toLocaleString()}
                    </td>
                    <td className="num-col">
                      {totals.unique_visitors.toLocaleString()}
                    </td>
                    <td className="num-col">
                      {fmtDuration(totals.avg_duration_seconds)}
                      <span className="data-table__cell-sub">
                        foreground tab only
                      </span>
                    </td>
                    <td className="num-col">
                      {`${totals.bounce_rate_pct}%`}
                      <span className="data-table__cell-sub">
                        single-page sessions
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : null}

          <SectionHeader title={`Daily totals (last ${trendRange} days)`} />

      {loading ? (
        <div className="chart-placeholder" />
      ) : chartData.length === 0 ? (
        <p className="empty-state">
          No data in this range yet. Visit a few pages, then refresh.
        </p>
      ) : (
        <div className="chart-wrapper chart-wrapper--daily">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart
              data={chartData}
              margin={{ top: 16, right: 12, left: 0, bottom: 4 }}
            >
              <defs>
                <linearGradient
                  id={areaGradientId}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--chart-daily-area-top)"
                    stopOpacity={0.55}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--chart-daily-area-bottom)"
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 6"
                stroke="var(--chart-daily-grid)"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tickFormatter={fmtShortDate}
                tick={{
                  fontSize: 11,
                  fill: 'var(--chart-daily-label)',
                }}
                tickLine={false}
                axisLine={{ stroke: 'var(--chart-daily-axis-line)' }}
                minTickGap={trendRange >= 90 ? 28 : trendRange <= 7 ? 4 : 8}
              />
              <YAxis
                tick={{
                  fontSize: 11,
                  fill: 'var(--chart-daily-label)',
                }}
                tickLine={false}
                axisLine={false}
                width={36}
                allowDecimals={false}
              />
              <Tooltip
                labelFormatter={(v) => fmtShortDate(String(v))}
                contentStyle={{
                  background: 'var(--chart-daily-tooltip-bg)',
                  border: '1px solid var(--chart-daily-tooltip-border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: 'var(--chart-daily-tooltip-fg)',
                }}
                labelStyle={{ color: 'var(--chart-daily-tooltip-muted)' }}
                itemStyle={{ color: 'var(--chart-daily-tooltip-fg)' }}
              />
              <Legend
                wrapperStyle={{
                  fontSize: '12px',
                  color: 'var(--chart-daily-legend)',
                  paddingTop: '4px',
                }}
              />
              <Area
                type="monotone"
                dataKey="page_views"
                name="Page views"
                stroke="var(--chart-daily-primary)"
                strokeWidth={1.5}
                fill={`url(#${areaGradientId})`}
                fillOpacity={1}
                dot={(dotProps: {
                  cx?: number;
                  cy?: number;
                  index?: number;
                }) => {
                  const { cx, cy, index } = dotProps;
                  if (
                    cx == null ||
                    cy == null ||
                    index == null ||
                    !isLocalPeak(chartData, index, 'page_views')
                  ) {
                    return null;
                  }
                  return (
                    <circle
                      key={`pv-peak-${index}`}
                      cx={cx}
                      cy={cy}
                      r={5}
                      fill="var(--chart-daily-peak-dot)"
                      stroke="var(--chart-daily-peak-ring)"
                      strokeWidth={1.5}
                    />
                  );
                }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="visits"
                name="Visits"
                stroke="var(--chart-daily-visits-line)"
                strokeWidth={1.25}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="unique_visitors"
                name="Unique visitors"
                stroke="var(--chart-daily-unique-line)"
                strokeWidth={1.25}
                dot={false}
                activeDot={{ r: 4 }}
              />
              {dailyChartMeta.meanPv > 0 &&
              Number.isFinite(dailyChartMeta.meanPv) ? (
                <ReferenceLine
                  y={dailyChartMeta.meanPv}
                  stroke="var(--chart-daily-mean-line)"
                  strokeDasharray="5 5"
                  strokeWidth={1}
                />
              ) : null}
              {dailyChartMeta.lastDay ? (
                <ReferenceLine
                  x={dailyChartMeta.lastDay}
                  stroke="var(--chart-daily-now-line)"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                />
              ) : null}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      <SectionHeader title="Top pages (all time)" />

      {loading ? (
        <LoadingPlaceholder rows={5} />
      ) : topPages.length === 0 ? (
        <p className="empty-state">No page view data yet.</p>
      ) : (
        <div className="table-wrapper">
          <table className="data-table data-table--top-pages">
            <thead>
              <tr>
                <th>Page</th>
                <th className="num-col">Views</th>
                <th className="num-col">Unique visitors</th>
                <th className="num-col">Avg. active time</th>
              </tr>
            </thead>
            <tbody>
              {topPages.map((page) => (
                <tr key={page.url}>
                  <td>
                    <a href={page.url} className="page-link" title={page.url}>
                      {truncateUrl(page.url)}
                    </a>
                  </td>
                  <td className="num-col">{page.page_views.toLocaleString()}</td>
                  <td className="num-col">
                    {page.unique_visitors.toLocaleString()}
                  </td>
                  <td className="num-col">
                    {fmtDuration(page.avg_duration_seconds)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {loading ? (
        <div className="table-wrapper">
          <table className="data-table data-table--metrics-row">
            <thead>
              <tr>
                <th className="num-col">Avg pages / session</th>
                <th className="num-col">Sessions with 2+ pages</th>
                <th className="num-col">Returning visitors</th>
                <th className="num-col">Unique visitors</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {Array.from({ length: 4 }).map((_, i) => (
                  <td key={i} className="num-col">
                    <div
                      className="summary-loading-bar"
                      aria-hidden="true"
                    />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ) : engagement ? (
        <div className="table-wrapper">
          <table className="data-table data-table--metrics-row">
            <thead>
              <tr>
                <th className="num-col">Avg pages / session</th>
                <th className="num-col">Sessions with 2+ pages</th>
                <th className="num-col">Returning visitors</th>
                <th className="num-col">Unique visitors</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="num-col">
                  {Number(engagement.avg_pages_per_session ?? 0).toFixed(2)}
                </td>
                <td className="num-col">
                  {Number(
                    engagement.sessions_with_2plus_pages ?? 0
                  ).toLocaleString()}
                  <span className="data-table__cell-sub">
                    of{' '}
                    {Number(engagement.sessions_total ?? 0).toLocaleString()}{' '}
                    sessions
                  </span>
                </td>
                <td className="num-col">
                  {Number(engagement.returning_visitors ?? 0).toLocaleString()}
                  {Number(engagement.unique_visitors_30d ?? 0) > 0 ? (
                    <span className="data-table__cell-sub">
                      {`${Math.round(
                        (100 * Number(engagement.returning_visitors ?? 0)) /
                          Number(engagement.unique_visitors_30d)
                      )}% of unique visitors`}
                    </span>
                  ) : null}
                </td>
                <td className="num-col">
                  {Number(engagement.unique_visitors_30d ?? 0).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}

      <SectionHeader title={`External links clicked (last ${trendRange} days)`} />

      {loading ? (
        <LoadingPlaceholder rows={3} />
      ) : externalLinks.length === 0 ? (
        <p className="empty-state">
          No external link clicks yet. Open a few outbound links from the docs,
          then refresh this page.
        </p>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Link</th>
                <th className="num-col">Clicks</th>
              </tr>
            </thead>
            <tbody>
              {externalLinks.map((row) => (
                <tr key={row.href}>
                  <td>
                    <a
                      href={row.href}
                      className="page-link"
                      title={row.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {truncateHref(row.href)}
                    </a>
                  </td>
                  <td className="num-col">
                    {Number(row.clicks).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <SectionHeader title="Events (all time)" />

      {loading ? (
        <LoadingPlaceholder rows={6} />
      ) : events.length === 0 ? (
        <p className="empty-state">No events recorded yet.</p>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Name</th>
                <th className="num-col">Count</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev, i) => (
                <tr key={i}>
                  <td>
                    <span className={`event-badge event-badge--${ev.event_type}`}>
                      {ev.event_type}
                    </span>
                  </td>
                  <td>{ev.event_name ?? '—'}</td>
                  <td className="num-col">{ev.event_count.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
        </div>
      </main>
    </>
  );
}
