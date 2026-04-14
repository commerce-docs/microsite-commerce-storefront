/**
 * Single entry for mounting Mermaid diagrams. Imported once from MarkdownContent.astro
 * so Vite bundles `mermaid-diagram.client` from a stable module path (not per-Diagram inline
 * scripts, which cannot resolve bare aliases and resolve `./` against the page URL).
 */

import { attachMermaidDiagramLifecycle } from './mermaid-diagram.client';

// Guard against accidental server-side imports (e.g. in tests or SSR bundles that pull this module).
if (typeof document === 'undefined') {
  throw new Error('[Diagram] mermaid-global-mount must only be imported in a browser context.');
}

function mountPendingMermaidDiagrams(): void {
  for (const el of document.querySelectorAll('.mermaid-diagram[data-pending-mermaid="true"]')) {
    if (!(el instanceof HTMLElement) || !el.id) continue;
    if (el.closest('#starlight__search')) continue;
    el.removeAttribute('data-pending-mermaid');
    attachMermaidDiagramLifecycle({ rootId: el.id });
  }
}

mountPendingMermaidDiagrams();

// Module-level flag: the module stays in memory across Astro client navigations, so this persists
// without polluting window with a string-keyed property (avoids name collisions and type gaps).
let pageLoadListenerRegistered = false;
if (!pageLoadListenerRegistered) {
  pageLoadListenerRegistered = true;
  document.addEventListener('astro:page-load', mountPendingMermaidDiagrams);
}
