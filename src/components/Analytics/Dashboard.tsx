import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
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

// ---------------------------------------------------------------------------
// Supabase client — env vars are replaced at build time by Vite
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
      {sub && <span className="stat-sub">{sub}</span>}
    </div>
  );
}

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

// ---------------------------------------------------------------------------
// Main Dashboard
// ---------------------------------------------------------------------------

export default function Dashboard() {
  const [totals, setTotals] = useState<Totals | null>(null);
  const [chartData, setChartData] = useState<DailySummary[]>([]);
  const [topPages, setTopPages] = useState<TopPage[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [totalsRes, chartRes, pagesRes, eventsRes] = await Promise.all([
          supabase.from('analytics_totals_30d').select('*').single(),
          supabase
            .from('analytics_summary')
            .select('*')
            .order('day', { ascending: true })
            .limit(30),
          supabase.from('top_pages').select('*').limit(20),
          supabase.from('events_summary').select('*').limit(30),
        ]);

        if (totalsRes.error) throw totalsRes.error;
        if (chartRes.error) throw chartRes.error;
        if (pagesRes.error) throw pagesRes.error;
        if (eventsRes.error) throw eventsRes.error;

        setTotals(totalsRes.data as Totals);
        setChartData((chartRes.data ?? []) as DailySummary[]);
        setTopPages((pagesRes.data ?? []) as TopPage[]);
        setEvents((eventsRes.data ?? []) as EventRow[]);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load analytics data.'
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const isConfigured =
    import.meta.env.PUBLIC_SUPABASE_URL &&
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  if (!isConfigured) {
    return (
      <div className="dashboard-container">
        <p className="setup-notice">
          Analytics not configured. Add{' '}
          <code>PUBLIC_SUPABASE_URL</code> and{' '}
          <code>PUBLIC_SUPABASE_ANON_KEY</code> to your{' '}
          <code>.env</code> file, then restart the dev server.
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* ---- Summary Cards ---- */}
      <SectionHeader title="Last 30 days" />

      {loading ? (
        <div className="cards-grid">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="stat-card loading-card" />
          ))}
        </div>
      ) : error ? (
        <ErrorBanner message={error} />
      ) : totals ? (
        <div className="cards-grid">
          <StatCard label="Visits" value={totals.visits.toLocaleString()} />
          <StatCard
            label="Page views"
            value={totals.page_views.toLocaleString()}
          />
          <StatCard
            label="Unique visitors"
            value={totals.unique_visitors.toLocaleString()}
          />
          <StatCard
            label="Avg. time on page"
            value={fmtDuration(totals.avg_duration_seconds)}
          />
          <StatCard
            label="Bounce rate"
            value={`${totals.bounce_rate_pct}%`}
            sub="single-page sessions"
          />
        </div>
      ) : null}

      {/* ---- Daily Trend Chart ---- */}
      <SectionHeader title="Daily trend" />

      {loading ? (
        <div className="chart-placeholder" />
      ) : chartData.length === 0 ? (
        <p className="empty-state">No data yet. Visit a few pages to see the trend.</p>
      ) : (
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart
              data={chartData}
              margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis
                dataKey="day"
                tickFormatter={fmtShortDate}
                tick={{ fontSize: 12, fill: 'var(--chart-label)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: 'var(--chart-label)' }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip
                labelFormatter={(v) => fmtShortDate(String(v))}
                contentStyle={{
                  background: 'var(--chart-tooltip-bg)',
                  border: '1px solid var(--chart-grid)',
                  borderRadius: '6px',
                  fontSize: '13px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '13px' }} />
              <Line
                type="monotone"
                dataKey="page_views"
                name="Page views"
                stroke="var(--chart-line-1)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="visits"
                name="Visits"
                stroke="var(--chart-line-2)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="unique_visitors"
                name="Unique visitors"
                stroke="var(--chart-line-3)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ---- Top Pages ---- */}
      <SectionHeader title="Top pages" />

      {loading ? (
        <LoadingPlaceholder rows={5} />
      ) : topPages.length === 0 ? (
        <p className="empty-state">No page view data yet.</p>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Page</th>
                <th className="num-col">Views</th>
                <th className="num-col">Unique visitors</th>
                <th className="num-col">Avg. time</th>
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

      {/* ---- Events Breakdown ---- */}
      <SectionHeader title="Events" />

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
  );
}
