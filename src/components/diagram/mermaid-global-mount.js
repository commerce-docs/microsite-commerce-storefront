/**
 * Single entry for mounting Mermaid diagrams. Loaded via `injectScript('page', …)` in
 * `astro.config.mjs` so Vite bundles this module with `mermaid-diagram.client` and `mermaid`.
 * Do not load this file with `import … ?url` — that emits only this file and leaves bare imports
 * that do not resolve on the CDN.
 */

import { attachMermaidDiagramLifecycle } from './mermaid-diagram.client';

if (typeof document === 'undefined') {
  throw new Error('[Diagram] mermaid-global-mount must only be imported in a browser context.');
}

function mountPendingMermaidDiagrams() {
  for (const el of document.querySelectorAll('.mermaid-diagram[data-pending-mermaid="true"]')) {
    if (!(el instanceof HTMLElement) || !el.id) continue;
    if (el.closest('#starlight__search')) continue;
    el.removeAttribute('data-pending-mermaid');
    attachMermaidDiagramLifecycle({ rootId: el.id });
  }
}

mountPendingMermaidDiagrams();

let pageLoadListenerRegistered = false;
if (!pageLoadListenerRegistered) {
  pageLoadListenerRegistered = true;
  document.addEventListener('astro:page-load', mountPendingMermaidDiagrams);
}
