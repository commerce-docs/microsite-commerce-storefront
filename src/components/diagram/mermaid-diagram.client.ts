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

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

let mermaidInitialized = false;

/** Index of `>` that closes the `<svg …>` open tag, respecting double/single-quoted attributes. */
function indexOfSvgOpenTagEnd(svgMarkup: string, svgNameStart: number): number {
  let inSingle = false;
  let inDouble = false;
  for (let i = svgNameStart; i < svgMarkup.length; i++) {
    const c = svgMarkup[i];
    if (c === '\\' && (inSingle || inDouble) && i + 1 < svgMarkup.length) {
      i += 1;
      continue;
    }
    if (c === "'" && !inDouble) {
      inSingle = !inSingle;
    } else if (c === '"' && !inSingle) {
      inDouble = !inDouble;
    } else if (c === '>' && !inSingle && !inDouble) {
      return i;
    }
  }
  return -1;
}

function stripWidthHeightAttrs(openTag: string): string {
  return openTag.replace(/\s+\b(width|height)\b\s*=\s*("([^"]*)"|'([^']*)')/gi, '');
}

function insertRasterDimensions(openTag: string, width: number, height: number): string {
  const stripped = stripWidthHeightAttrs(openTag);
  const add = ` width="${width}" height="${height}"`;
  const trimmed = stripped.trimEnd();
  const trailingWs = stripped.slice(trimmed.length);
  if (/\/>\s*$/i.test(trimmed)) {
    return trimmed.replace(/\/>$/i, `${add}/>`) + trailingWs;
  }
  return trimmed.replace(/>$/i, `${add}>`) + trailingWs;
}

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

/**
 * Sets raster width/height from `viewBox` and inserts a white `<rect>` after the root `<svg>` open
 * tag using **string operations only** (no `DOMParser.parseFromString`), so CodeQL does not flag
 * `js/xss-through-dom` on Mermaid SVG output.
 */
function applySvgRasterHints(svgMarkup: string): { serialized: string; widthAttr: string; heightAttr: string } {
  const defaultW = String(DEFAULT_RASTER_WIDTH);
  const defaultH = String(DEFAULT_RASTER_HEIGHT);

  const svgStart = svgMarkup.search(/<svg\b/i);
  if (svgStart < 0) {
    return { serialized: svgMarkup, widthAttr: defaultW, heightAttr: defaultH };
  }

  const nameMatch = svgMarkup.slice(svgStart).match(/^<svg\b/i);
  const nameLen = nameMatch?.[0].length ?? 4;
  const openEnd = indexOfSvgOpenTagEnd(svgMarkup, svgStart + nameLen);
  if (openEnd < 0) {
    return { serialized: svgMarkup, widthAttr: defaultW, heightAttr: defaultH };
  }

  const openTag = svgMarkup.slice(svgStart, openEnd + 1);
  if (/\/>\s*$/i.test(openTag.trimEnd())) {
    return { serialized: svgMarkup, widthAttr: defaultW, heightAttr: defaultH };
  }

  let width = DEFAULT_RASTER_WIDTH;
  let height = DEFAULT_RASTER_HEIGHT;
  const viewBoxMatch = openTag.match(/\bviewBox\s*=\s*(["'])([\s\S]*?)\1/i);
  const viewBox = viewBoxMatch?.[2]?.trim();
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

  const newOpen = insertRasterDimensions(openTag, width, height);
  const rect = `<rect xmlns="${SVG_NAMESPACE}" width="100%" height="100%" fill="white"/>`;
  const serialized = `${svgMarkup.slice(0, svgStart)}${newOpen}${rect}${svgMarkup.slice(openEnd + 1)}`;

  return {
    serialized,
    widthAttr: String(width),
    heightAttr: String(height),
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
  // Build SVG via createElementNS rather than innerHTML to avoid any future static-analysis
  // complaints about DOM-based XSS (content is static, but CodeQL already flagged this file once).
  const svgIcon = document.createElementNS(SVG_NAMESPACE, 'svg');
  svgIcon.setAttribute('aria-hidden', 'true');
  svgIcon.setAttribute('fill', 'currentColor');
  svgIcon.setAttribute('viewBox', '0 0 24 24');
  const useEl = document.createElementNS(SVG_NAMESPACE, 'use');
  useEl.setAttribute('href', '#starlight-image-zoom-icon-zoom');
  svgIcon.appendChild(useEl);
  zoomButton.appendChild(svgIcon);

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

/** Reads Mermaid source from the embedded JSON script tag injected by Diagram.astro. */
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
  return '';
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
    if (attempt === 10) {
      console.warn('[Diagram] Container still not found after 500 ms, keep retrying:', rootId);
    }
    if (attempt >= 20) {
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
