/**
 * Custom Analytics Tracking Script
 *
 * Captures page views, time on page, bounce rate, clicks, scroll depth,
 * and form interactions, then writes them to Supabase via the REST API.
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

function uuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers in non-secure contexts
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
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

async function dbInsert(
  table: string,
  data: Record<string, unknown>
): Promise<void> {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: supabaseHeaders(),
      body: JSON.stringify(data),
    });
  } catch {
    // Analytics must never break the page
  }
}

async function dbPatch(
  table: string,
  filter: string,
  data: Record<string, unknown>
): Promise<void> {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
      method: 'PATCH',
      headers: supabaseHeaders(),
      body: JSON.stringify(data),
      // keepalive ensures the request completes even after page navigation
      keepalive: true,
    });
  } catch {
    // Analytics must never break the page
  }
}

// ---------------------------------------------------------------------------
// Main init
// ---------------------------------------------------------------------------

(function init() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;
  if (isBot()) return;

  const { sessionId, visitorId } = getIds();
  const pageViewId = uuid();
  const pageLoadTime = Date.now();

  // Track whether the visitor navigates to another page (not a bounce)
  let navigated = false;

  // ---- Page view ----
  dbInsert('page_views', {
    id: pageViewId,
    session_id: sessionId,
    visitor_id: visitorId,
    url: location.href,
    referrer: document.referrer || null,
    title: document.title,
  });

  // ---- Duration + bounce on unload ----
  window.addEventListener('pagehide', () => {
    const duration = Math.round((Date.now() - pageLoadTime) / 1000);
    dbPatch('page_views', `id=eq.${pageViewId}`, {
      duration_seconds: duration,
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

  // ---- Click events ----
  document.addEventListener('click', (e) => {
    const target = e.target as Element;
    const link = target.closest('a');
    const button = target.closest('button');
    const el = link ?? button;
    if (!el) return;

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
