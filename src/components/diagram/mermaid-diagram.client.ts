/**
 * Client-side Mermaid rendering for `Diagram.astro`.
 * Kept separate so the Astro file stays markup + styles, and this file stays testable logic.
 */

import mermaidApi from 'mermaid';

const DEFAULT_RASTER_WIDTH = 1920;
const DEFAULT_RASTER_HEIGHT = 1080;
const RESCAN_DEBOUNCE_MS = 150;

/** One debounced rescan for the whole page (many diagrams can mount in one tick). */
let zoomRescanTimer: number | null = null;

/** Mount callbacks re-run after client navigations; cleared in {@link ensureGlobalPreparationHook}. */
const pageLoadMounts = new Map<string, () => void>();

/** Clears debounced zoom rescan and page-load mount map when Starlight tears the page down. */
let globalPreparationHooked = false;

function ensureGlobalPreparationHook() {
  if (globalPreparationHooked) return;
  globalPreparationHooked = true;
  document.addEventListener('astro:before-preparation', () => {
    if (zoomRescanTimer != null) {
      clearTimeout(zoomRescanTimer);
      zoomRescanTimer = null;
    }
    pageLoadMounts.clear();
  });
}

function scheduleStarlightImageZoomRescan() {
  ensureGlobalPreparationHook();
  if (zoomRescanTimer != null) {
    clearTimeout(zoomRescanTimer);
  }
  zoomRescanTimer = window.setTimeout(() => {
    zoomRescanTimer = null;
    document.dispatchEvent(
      new CustomEvent('astro:after-swap', {
        bubbles: true,
        cancelable: true,
      }),
    );
  }, RESCAN_DEBOUNCE_MS);
}

/** Abort any in-flight work for this container before a new mount. */
const mountAbortByContainer = new WeakMap<HTMLElement, AbortController>();

/** Minimal Mermaid surface used here. */
type MermaidApi = {
  initialize: (config: Record<string, unknown>) => void;
  render: (id: string, text: string) => Promise<{ svg: string }>;
};

const mermaid = mermaidApi as unknown as MermaidApi;

let mermaidInitialized = false;

function ensureMermaidInitialized(): void {
  if (mermaidInitialized) return;
  mermaidInitialized = true;
  mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'strict',
    fontFamily: 'Arial, sans-serif',
  });
}

function applySvgRasterHints(svgMarkup: string): { serialized: string; widthAttr: string; heightAttr: string } {
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgMarkup, 'image/svg+xml');
  const svgElement = svgDoc.querySelector('svg');

  let widthAttr = String(DEFAULT_RASTER_WIDTH);
  let heightAttr = String(DEFAULT_RASTER_HEIGHT);

  if (svgElement) {
    let width = DEFAULT_RASTER_WIDTH;
    let height = DEFAULT_RASTER_HEIGHT;
    const viewBox = svgElement.getAttribute('viewBox');
    if (viewBox) {
      const parts = viewBox.split(/\s+/).map(Number);
      const vbWidth = parts[2];
      const vbHeight = parts[3];
      if (vbWidth > 0 && vbHeight > 0) {
        const aspectRatio = vbWidth / vbHeight;
        if (aspectRatio > 2) {
          height = Math.round(width / aspectRatio);
        }
      }
    }
    svgElement.setAttribute('width', String(width));
    svgElement.setAttribute('height', String(height));
    widthAttr = svgElement.getAttribute('width') || widthAttr;
    heightAttr = svgElement.getAttribute('height') || heightAttr;

    const rect = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', '100%');
    rect.setAttribute('height', '100%');
    rect.setAttribute('fill', 'white');
    svgElement.insertBefore(rect, svgElement.firstChild);
  }

  return {
    serialized: new XMLSerializer().serializeToString(svgDoc),
    widthAttr,
    heightAttr,
  };
}

function buildStarlightZoomable(imgSrc: string, widthAttr: string, heightAttr: string) {
  const zoomableWrapper = document.createElement('starlight-image-zoom-zoomable');
  const img = document.createElement('img');
  img.src = imgSrc;
  img.alt = 'Mermaid diagram';
  img.setAttribute('width', widthAttr);
  img.setAttribute('height', heightAttr);
  img.style.cssText = 'max-width: 100%; height: auto; display: block;';

  const zoomButton = document.createElement('button');
  zoomButton.setAttribute('aria-label', 'Zoom image: Mermaid diagram');
  zoomButton.className = 'starlight-image-zoom-control';
  zoomButton.innerHTML = `
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
      <use href="#starlight-image-zoom-icon-zoom"></use>
    </svg>
  `;

  zoomableWrapper.append(img, zoomButton);
  return { zoomableWrapper, img };
}

/** Run after layout so Mermaid and the img target nodes in the live document (not pre-paint). */
function afterNextPaint(fn: () => void): void {
  requestAnimationFrame(() => {
    requestAnimationFrame(fn);
  });
}

function showRenderError(container: HTMLElement, message: string) {
  const box = document.createElement('div');
  box.className = 'diagram-mermaid-error';
  box.textContent = `Error: ${message}`;
  container.replaceChildren(box);
}

/**
 * Pagefind injects indexed HTML into `#starlight__search`, which can duplicate the same `id` as
 * the live page. `getElementById` would return the search hit first and leave in-page diagrams stuck
 * on "Loading…". Prefer the instance outside the search modal.
 */
function resolveMermaidContainer(containerId: string): HTMLElement | null {
  const matches = document.querySelectorAll<HTMLElement>(`#${CSS.escape(containerId)}`);
  if (matches.length === 0) {
    return null;
  }
  if (matches.length === 1) {
    return matches[0];
  }
  const outsideSearch = [...matches].filter((el) => !el.closest('#starlight__search'));
  return outsideSearch[0] ?? matches[0];
}

/** Prefer embedded JSON (see Diagram.astro); optional legacy `data-mermaid-code`. */
function readMermaidSourceFromContainer(container: HTMLElement): string {
  const scriptEl = container.querySelector('script.mermaid-diagram__source[type="application/json"]');
  const raw = scriptEl?.textContent?.trim();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (typeof parsed === 'string') {
        return parsed.trim();
      }
    } catch {
      /* fall through */
    }
  }
  return (container.getAttribute('data-mermaid-code')?.trim() || '').trim();
}

/**
 * Renders Mermaid into the given container and registers the starlight-image-zoom rescan.
 */
export async function mountMermaidDiagram(options: {
  containerId: string;
  /** Optional override (tests); otherwise source is read from the container DOM. */
  source?: string;
  signal: AbortSignal;
}): Promise<void> {
  const { containerId, source = '', signal } = options;
  const container = resolveMermaidContainer(containerId);
  if (!container) {
    console.error('[Diagram] Container not found:', containerId);
    return;
  }

  const resolvedSource = (source.trim() || readMermaidSourceFromContainer(container)).trim();
  if (!resolvedSource) {
    showRenderError(container, 'No Mermaid source was provided for this diagram.');
    return;
  }

  try {
    ensureMermaidInitialized();
    if (signal.aborted) return;

    const { svg } = await mermaid.render(`${containerId}-svg`, resolvedSource);
    if (signal.aborted) return;

    const { serialized, widthAttr, heightAttr } = applySvgRasterHints(svg);
    // Data URI avoids blob lifecycle and decode ordering issues (same approach as prior Diagram fix).
    const imgSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serialized)}`;

    const { zoomableWrapper, img } = buildStarlightZoomable(imgSrc, widthAttr, heightAttr);
    container.replaceChildren(zoomableWrapper);

    if (signal.aborted) {
      return;
    }

    // Do not `await customElements.whenDefined('starlight-image-zoom')`: the ImageZoom module can
    // execute after this module; awaiting would deadlock while the UI still shows "Loading…" if
    // reordering ever regressed. Rescan immediately and once more when the CE is defined.
    scheduleStarlightImageZoomRescan();
    void customElements.whenDefined('starlight-image-zoom').then(() => {
      if (!signal.aborted) {
        scheduleStarlightImageZoomRescan();
      }
    });

    void img.decode().catch(() => {
      /* decode is optional; ignore if unsupported or SVG fails decode */
    });
  } catch (error) {
    if (signal.aborted) return;
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Diagram] Mermaid render failed:', error);
    showRenderError(container, message);
  }
}

let pageLoadListenerRegistered = false;

function ensureAstroPageLoadListener() {
  if (pageLoadListenerRegistered) return;
  pageLoadListenerRegistered = true;
  ensureGlobalPreparationHook();

  document.addEventListener('astro:page-load', () => {
    afterNextPaint(() => {
      for (const run of pageLoadMounts.values()) {
        run();
      }
    });
  });
}

/**
 * Wires DOM ready + Astro client navigations. Each container gets its own {@link AbortController}
 * so a new mount cancels stale async work.
 */
export function attachMermaidDiagramLifecycle(options: { rootId: string; mermaidSource?: string }) {
  const { rootId, mermaidSource = '' } = options;

  const startMount = () => {
    const container = resolveMermaidContainer(rootId);
    if (!container) {
      return false;
    }

    mountAbortByContainer.get(container)?.abort();
    const ac = new AbortController();
    mountAbortByContainer.set(container, ac);

    mountMermaidDiagram({
      containerId: rootId,
      ...(mermaidSource ? { source: mermaidSource } : {}),
      signal: ac.signal,
    }).catch((err) => {
      console.error('[Diagram] mountMermaidDiagram rejected:', err);
    });
    return true;
  };

  /** Wait until the SSR'd node exists (View Transitions / slot timing can run the script early). */
  const runMountWithRetries = (attempt = 0) => {
    if (startMount()) {
      return;
    }
    if (attempt >= 100) {
      console.error('[Diagram] Container not found after retries:', rootId);
      return;
    }
    window.setTimeout(() => runMountWithRetries(attempt + 1), 50);
  };

  const runMount = () => {
    runMountWithRetries(0);
  };

  pageLoadMounts.set(rootId, runMount);
  ensureAstroPageLoadListener();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => afterNextPaint(runMount), { once: true });
  } else {
    afterNextPaint(runMount);
  }
}
