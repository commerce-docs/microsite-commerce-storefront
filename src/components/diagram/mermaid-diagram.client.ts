/**
 * Client-side Mermaid rendering for `Diagram.astro`.
 * Kept separate so the Astro file stays markup + styles, and this file stays testable logic.
 *
 * Rendering strategy:
 *  1. Call mermaid.render() with a per-container unique ID — no global ID collisions even when
 *     multiple diagrams render concurrently.
 *  2. Inject the returned SVG string into an inert <template> staging element to obtain a live
 *     DOM node.  The SVG is DOMPurify-sanitised by mermaid (securityLevel:'strict') before being
 *     returned, so the innerHTML assignment is safe and avoids js/xss-through-dom.
 *  3. Serialise the staged SVG to a Blob URL and mount it as an <img> element. Using <img>
 *     instead of an inline <svg> avoids two zoom-plugin bugs:
 *       a) cloneNode(true) on <svg> duplicates <defs> marker IDs → arrows disappear in zoomed view.
 *       b) starlight-image-zoom treats <svg> natural dimensions as innerWidth × innerHeight, which
 *          breaks the starting-position translate for full-width diagrams.
 *  4. Wrap the <img> in a starlight-image-zoom-zoomable structure so the existing zoom plugin
 *     picks it up.
 *  5. Dispatch a debounced astro:after-swap event so starlight-image-zoom rescans the page.
 */

import mermaidApi from 'mermaid';

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const RESCAN_DEBOUNCE_MS = 150;

/** One debounced rescan for the whole page (many diagrams can mount in one tick). */
let zoomRescanTimer: number | null = null;

/** Mount callbacks re-run after client navigations; cleared in {@link ensureGlobalPreparationHook}. */
const pageLoadMounts = new Map<string, () => void>();

/** All active Blob URLs — revoked on client navigation to prevent memory leaks. */
const activeBlobUrls = new Set<string>();

/** Per-container Blob URL tracking for targeted revocation on re-mount. */
let blobUrlByContainer = new WeakMap<HTMLElement, string>();

/** Clears debounced zoom rescan and page-load mount map when Starlight tears the page down. */
let globalPreparationHooked = false;

function ensureGlobalPreparationHook() {
  if (globalPreparationHooked) return;
  globalPreparationHooked = true;
  document.addEventListener('astro:before-preparation', () => {
    if (zoomRescanTimer !== null) {
      clearTimeout(zoomRescanTimer);
      zoomRescanTimer = null;
    }
    pageLoadMounts.clear();
    // Revoke all Blob URLs to prevent memory leaks during client navigation.
    for (const url of activeBlobUrls) {
      URL.revokeObjectURL(url);
    }
    activeBlobUrls.clear();
    blobUrlByContainer = new WeakMap();
  });
}

/** Trigger starlight-image-zoom to rescan the page for new SVG/img elements. */
function scheduleStarlightImageZoomRescan() {
  ensureGlobalPreparationHook();
  if (zoomRescanTimer !== null) {
    clearTimeout(zoomRescanTimer);
  }
  zoomRescanTimer = window.setTimeout(() => {
    zoomRescanTimer = null;
    document.dispatchEvent(
      new CustomEvent('astro:after-swap', { bubbles: true, cancelable: true }),
    );
  }, RESCAN_DEBOUNCE_MS);
}

/** Abort any in-flight work for this container before a new mount. */
const mountAbortByContainer = new WeakMap<HTMLElement, AbortController>();

/** Minimal Mermaid surface used here. */
type MermaidApi = {
  initialize: (config: Record<string, unknown>) => void;
  render: (
    id: string,
    text: string,
  ) => Promise<{ svg: string; bindFunctions?: (el: Element) => void }>;
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

function showRenderError(container: HTMLElement, message: string) {
  const box = document.createElement('div');
  box.className = 'diagram-mermaid-error';
  box.textContent = `Error: ${message}`;
  container.replaceChildren(box);
}

/**
 * Pagefind injects indexed HTML into `#starlight__search`, which can duplicate the same `id` as
 * the live page.  Prefer the instance outside the search modal.
 */
function resolveMermaidContainer(containerId: string): HTMLElement | null {
  const matches = document.querySelectorAll<HTMLElement>(`#${CSS.escape(containerId)}`);
  if (matches.length === 0) return null;
  if (matches.length === 1) return matches[0];
  const outsideSearch = [...matches].filter((el) => !el.closest('#starlight__search'));
  return outsideSearch[0] ?? matches[0];
}

/** Reads Mermaid source from the embedded JSON template element injected by Diagram.astro. */
function readMermaidSourceFromContainer(container: HTMLElement): string {
  const templateEl = container.querySelector<HTMLTemplateElement>('template.mermaid-diagram__source');
  const raw = templateEl?.innerHTML?.trim();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (typeof parsed === 'string') return parsed.trim();
    } catch {
      /* fall through */
    }
  }
  return '';
}

/** Run after layout so Mermaid and SVG target nodes are in the live document (not pre-paint). */
function afterNextPaint(fn: () => void): void {
  requestAnimationFrame(() => requestAnimationFrame(fn));
}

/**
 * Revokes the Blob URL previously registered for a container (called before re-mounting).
 */
function revokeBlobUrlForContainer(container: HTMLElement): void {
  const url = blobUrlByContainer.get(container);
  if (url) {
    URL.revokeObjectURL(url);
    blobUrlByContainer.delete(container);
    activeBlobUrls.delete(url);
  }
}

/**
 * Serialises an SVG element to a Blob URL suitable for use in an <img> element.
 *
 * Sets explicit pixel dimensions from the viewBox so the browser reports correct
 * naturalWidth/naturalHeight — which starlight-image-zoom uses to compute the zoom scale
 * and starting position.  Without this, an SVG with width="100%" reports natural dimensions
 * of 0×0, breaking the zoom translate calculation.
 *
 * The caller is responsible for revoking the URL via URL.revokeObjectURL() when done.
 */
function svgToBlobUrl(svgEl: SVGSVGElement): string {
  const viewBox = svgEl.getAttribute('viewBox') ?? '';
  const parts = viewBox.split(/[\s,]+/).map(Number);
  const vbWidth = Number.isFinite(parts[2]) && parts[2] > 0 ? parts[2] : 800;
  const vbHeight = Number.isFinite(parts[3]) && parts[3] > 0 ? parts[3] : 600;

  // Clone to avoid mutating the element we just staged — setAttribute changes would
  // affect the SVG string we're about to serialise, not the live (absent) DOM.
  const clone = svgEl.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('width', String(vbWidth));
  clone.setAttribute('height', String(vbHeight));
  // Ensure the standalone SVG document has the required namespace declaration.
  if (!clone.hasAttribute('xmlns')) {
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }

  const svgString = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  activeBlobUrls.add(url);
  return url;
}

/**
 * Wraps an <img> (loaded from a Blob URL of the Mermaid SVG) in the structure
 * starlight-image-zoom expects:
 *   <starlight-image-zoom-zoomable>
 *     <img src="blob:…" alt="Mermaid diagram" class="mermaid-diagram__img" />
 *     <button class="starlight-image-zoom-control">…</button>
 *   </starlight-image-zoom-zoomable>
 *
 * Using <img> instead of an inline <svg> fixes two zoom-plugin bugs:
 *   1. cloneNode(true) on <svg> duplicates <defs> marker IDs — arrow markers become ambiguous
 *      and disappear in the zoomed clone.
 *   2. The plugin treats <svg> natural dimensions as window.innerWidth × window.innerHeight,
 *      which breaks the starting-position translate for full-width diagrams.  <img> reports
 *      the correct naturalWidth/naturalHeight from the Blob URL SVG.
 */
function buildZoomableWrapper(imgEl: HTMLImageElement): Element {
  const wrapper = document.createElement('starlight-image-zoom-zoomable');

  const button = document.createElement('button');
  button.setAttribute('aria-label', 'Zoom image: Mermaid diagram');
  button.className = 'starlight-image-zoom-control';

  // Build the icon via createElementNS — static content, but avoids any innerHTML on our side.
  const icon = document.createElementNS(SVG_NAMESPACE, 'svg');
  icon.setAttribute('aria-hidden', 'true');
  icon.setAttribute('fill', 'currentColor');
  icon.setAttribute('viewBox', '0 0 24 24');
  const use = document.createElementNS(SVG_NAMESPACE, 'use');
  use.setAttribute('href', '#starlight-image-zoom-icon-zoom');
  icon.appendChild(use);
  button.appendChild(icon);

  wrapper.append(imgEl, button);
  return wrapper;
}

/**
 * Renders a Mermaid diagram into the given container and wires up starlight-image-zoom.
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

    // Render ID is scoped to this container — unique across all concurrent renders on the page.
    const { svg } = await mermaid.render(`${containerId}-svg`, resolvedSource);
    if (signal.aborted) return;

    // Parse the DOMPurify-sanitised SVG via an inert <template> DocumentFragment.
    // A <template> never renders, executes scripts, or loads external resources during parsing.
    const staging = document.createElement('template');
    staging.innerHTML = svg;
    const svgEl = staging.content.querySelector('svg');
    if (!svgEl) {
      showRenderError(container, 'Mermaid returned no SVG element.');
      return;
    }

    // Revoke any previous Blob URL registered for this container (re-mount scenario).
    revokeBlobUrlForContainer(container);

    // Serialise the SVG to a Blob URL so starlight-image-zoom can zoom it via <img>.
    // This avoids two bugs with inline <svg> + zoom: duplicate <defs> marker IDs cause missing
    // arrows in the clone, and the plugin's naturalWidth/naturalHeight logic is broken for SVG.
    const blobUrl = svgToBlobUrl(svgEl as SVGSVGElement);
    blobUrlByContainer.set(container, blobUrl);

    // Create the <img> element that starlight-image-zoom will zoom.
    const imgEl = document.createElement('img');
    imgEl.src = blobUrl;
    imgEl.alt = 'Mermaid diagram';
    imgEl.className = 'mermaid-diagram__img';

    // Wrap in the starlight-image-zoom structure and insert into the visible container.
    const wrapper = buildZoomableWrapper(imgEl);
    container.replaceChildren(wrapper);

    // Make the entire .diagram-content area clickable for zoom, not just the img.
    // starlight-image-zoom's document click listener only responds to img/svg targets, so
    // clicks in the padding/empty space around the diagram do nothing without this handler.
    // We route those clicks to the zoom button, which has its own registered handler.
    const diagramContent = container.closest<HTMLElement>('.diagram-content');
    const zoomButton = wrapper.querySelector<HTMLButtonElement>('button.starlight-image-zoom-control');
    if (diagramContent && zoomButton) {
      const onContentClick = (event: MouseEvent) => {
        // img clicks are already handled by starlight-image-zoom's document listener;
        // button clicks are handled by the button's own listener — skip both.
        if (event.target instanceof HTMLImageElement || event.target instanceof HTMLButtonElement) return;
        // Stop propagation before triggering zoom: without this the original click continues
        // bubbling to starlight-image-zoom's document #onClick, which sees currentZoom is
        // now set and immediately closes the dialog that was just opened.
        event.stopPropagation();
        zoomButton.click();
      };
      diagramContent.addEventListener('click', onContentClick);
      // Remove listener when this mount is superseded by a re-mount.
      signal.addEventListener('abort', () => diagramContent.removeEventListener('click', onContentClick));
    }

    // Trigger starlight-image-zoom to pick up the new <img>.  Schedule immediately and again
    // once the custom element is defined, in case this module loads before the zoom plugin.
    scheduleStarlightImageZoomRescan();
    void customElements.whenDefined('starlight-image-zoom').then(() => {
      if (!signal.aborted) scheduleStarlightImageZoomRescan();
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
    if (!container) return false;

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
    if (startMount()) return;
    if (attempt === 10) {
      console.warn('[Diagram] Container still not found after 500 ms, keep retrying:', rootId);
    }
    if (attempt >= 20) {
      console.error('[Diagram] Container not found after retries:', rootId);
      return;
    }
    window.setTimeout(() => runMountWithRetries(attempt + 1), 50);
  };

  const runMount = () => runMountWithRetries(0);

  pageLoadMounts.set(rootId, runMount);
  ensureAstroPageLoadListener();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => afterNextPaint(runMount), { once: true });
  } else {
    afterNextPaint(runMount);
  }
}
