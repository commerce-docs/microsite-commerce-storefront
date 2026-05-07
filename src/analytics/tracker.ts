/**
 * Custom Analytics Tracking Script
 *
 * Captures page views, active time on page (foreground tab only via Page Visibility),
 * bounce rate, clicks, scroll depth, form interactions, and external link clicks, then writes
 * them to Supabase via the REST API.
 *
 * Injected on every page via the Astro integration in astro.config.mjs.
 * No cookies are set. Visitor IDs are random UUIDs stored in localStorage.
 */

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const SUPABASE_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isBot(): boolean {
  if (typeof navigator === 'undefined') return true;
  if (navigator.webdriver) return true;
  return /bot|crawl|slurp|spider|mediapartners|prerender|headlesschrome/i.test(
    navigator.userAgent
  );
}

/** Standalone analytics dashboard (`/analytics`); not doc topics under `/setup/analytics/`. */
function isAnalyticsDashboardPage(): boolean {
  const path = location.pathname.replace(/\/+$/, '') || '/';
  return path.endsWith('/analytics');
}

function uuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);

    // RFC 4122 version 4
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(
      16,
      20
    )}-${hex.slice(20)}`;
  }

  // Last-resort non-cryptographic fallback in very old environments.
  // Avoid Math.random to prevent predictable PRNG use in security checks.
  return `legacy-${Date.now().toString(36)}-${performance.now().toString(36).replace('.', '')}`;
}

function getIds(): { sessionId: string; visitorId: string } {
  let sessionId = sessionStorage.getItem('_a_sid');
  if (!sessionId) {
    sessionId = uuid();
    sessionStorage.setItem('_a_sid', sessionId);
  }

  let visitorId = localStorage.getItem('_a_vid');
  if (!visitorId) {
    visitorId = uuid();
    localStorage.setItem('_a_vid', visitorId);
  }

  return { sessionId, visitorId };
}

// ---------------------------------------------------------------------------
// Supabase REST calls
// ---------------------------------------------------------------------------

const supabaseHeaders = (): Record<string, string> => ({
  apikey: SUPABASE_KEY!,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=minimal',
});

function dbInsert(table: string, data: Record<string, unknown>): void {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;
  void fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: supabaseHeaders(),
    body: JSON.stringify(data),
    keepalive: true,
    mode: 'cors',
  }).catch(() => {
    // Analytics must never break the page
  });
}

function isExternalUrl(url: URL): boolean {
  return url.origin !== location.origin;
}

function dbPatch(
  table: string,
  filter: string,
  data: Record<string, unknown>
): void {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;
  void fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
    method: 'PATCH',
    headers: supabaseHeaders(),
    body: JSON.stringify(data),
    keepalive: true,
    mode: 'cors',
  }).catch(() => {});
}

// ---------------------------------------------------------------------------
// Main init
// ---------------------------------------------------------------------------

(function init() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;
  if (isBot()) return;
  if (isAnalyticsDashboardPage()) return;

  const { sessionId, visitorId } = getIds();
  const pageViewId = uuid();

  // Track whether the visitor navigates to another page (not a bounce)
  let navigated = false;

  // ---- Visible dwell time only (ignore background tabs / minimized windows) ----
  let visibleMs = 0;
  let visibleStartedAt: number | null = null;

  function pauseVisibleClock() {
    if (visibleStartedAt !== null) {
      visibleMs += Date.now() - visibleStartedAt;
      visibleStartedAt = null;
    }
  }

  function syncVisibleClock() {
    if (document.visibilityState === 'visible') {
      if (visibleStartedAt === null) {
        visibleStartedAt = Date.now();
      }
    } else {
      pauseVisibleClock();
    }
  }

  document.addEventListener('visibilitychange', syncVisibleClock);
  syncVisibleClock();

  // ---- Page view ----
  dbInsert('page_views', {
    id: pageViewId,
    session_id: sessionId,
    visitor_id: visitorId,
    url: location.href,
    referrer: document.referrer || null,
    title: document.title,
  });

  // ---- Active duration + bounce on unload ----
  window.addEventListener('pagehide', () => {
    pauseVisibleClock();
    const duration = Math.round(visibleMs / 1000);
    dbPatch('page_views', `id=eq.${pageViewId}`, {
      duration_seconds: duration,
      // Per-page "no internal click before leave" — dashboards use session-level bounce in SQL
      is_bounce: !navigated,
    });
  });

  // ---- Detect in-page navigation (marks session as non-bounce) ----
  document.addEventListener(
    'click',
    (e) => {
      const anchor = (e.target as Element).closest('a');
      if (anchor?.href) {
        const dest = new URL(anchor.href, location.href);
        if (dest.hostname === location.hostname) {
          navigated = true;
        }
      }
    },
    { capture: true }
  );

  // ---- External links: capture phase + sync dbInsert so the request starts before navigation ----
  document.addEventListener(
    'click',
    (e) => {
      const link = (e.target as Element | null)?.closest('a');
      if (!link?.href) return;
      let dest: URL;
      try {
        dest = new URL(link.href, location.href);
      } catch {
        return;
      }
      if (!isExternalUrl(dest)) return;
      dbInsert('events', {
        session_id: sessionId,
        visitor_id: visitorId,
        url: location.href,
        event_type: 'external_link',
        event_name: 'click',
        event_data: {
          href: dest.href.slice(0, 2000),
          link_text: link.textContent?.trim().slice(0, 200) ?? null,
        },
      });
    },
    true
  );

  // ---- Click events (generic; external links are skipped — recorded above) ----
  document.addEventListener('click', (e) => {
    const target = e.target as Element;
    const link = target.closest('a');
    const button = target.closest('button');
    const el = link ?? button;
    if (!el) return;

    if (link?.href) {
      try {
        const dest = new URL(link.href, location.href);
        if (isExternalUrl(dest)) return;
      } catch {
        // ignore bad href
      }
    }

    dbInsert('events', {
      session_id: sessionId,
      visitor_id: visitorId,
      url: location.href,
      event_type: 'click',
      event_name: link ? 'link_click' : 'button_click',
      event_data: {
        text: el.textContent?.trim().slice(0, 100) ?? null,
        href: link?.getAttribute('href') ?? null,
      },
    });
  });

  // ---- Scroll depth ----
  const scrollThresholds = [25, 50, 75, 100] as const;
  const firedDepths = new Set<number>();

  const onScroll = () => {
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;

    const pct = Math.round((window.scrollY / docHeight) * 100);

    for (const threshold of scrollThresholds) {
      if (pct >= threshold && !firedDepths.has(threshold)) {
        firedDepths.add(threshold);
        dbInsert('events', {
          session_id: sessionId,
          visitor_id: visitorId,
          url: location.href,
          event_type: 'scroll',
          event_name: `scroll_${threshold}pct`,
          event_data: { depth_pct: threshold },
        });
      }
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });

  // ---- Form interactions ----
  document.addEventListener('focusin', (e) => {
    const el = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    if (!['INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName)) return;

    dbInsert('events', {
      session_id: sessionId,
      visitor_id: visitorId,
      url: location.href,
      event_type: 'form',
      event_name: 'field_focus',
      event_data: {
        field_type: (el as HTMLInputElement).type ?? el.tagName.toLowerCase(),
        field_name: el.name || el.id || null,
      },
    });
  });

  document.addEventListener('submit', (e) => {
    const form = e.target as HTMLFormElement;
    dbInsert('events', {
      session_id: sessionId,
      visitor_id: visitorId,
      url: location.href,
      event_type: 'form',
      event_name: 'form_submit',
      event_data: {
        form_id: form.id || null,
        form_action: form.action || null,
      },
    });
  });
})();
