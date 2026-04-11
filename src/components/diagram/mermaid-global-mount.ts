/**
 * Single entry for mounting Mermaid diagrams. Imported once from MarkdownContent.astro
 * so Vite bundles `mermaid-diagram.client` from a stable module path (not per-Diagram inline
 * scripts, which cannot resolve bare aliases and resolve `./` against the page URL).
 */

import { attachMermaidDiagramLifecycle } from './mermaid-diagram.client';

function mountPendingMermaidDiagrams(): void {
  for (const el of document.querySelectorAll('.mermaid-diagram[data-pending-mermaid="true"]')) {
    if (!(el instanceof HTMLElement) || !el.id) continue;
    if (el.closest('#starlight__search')) continue;
    el.removeAttribute('data-pending-mermaid');
    attachMermaidDiagramLifecycle({ rootId: el.id });
  }
}

mountPendingMermaidDiagrams();

const w = window as unknown as { __mermaidDiagramPageLoad?: boolean };
if (!w.__mermaidDiagramPageLoad) {
  w.__mermaidDiagramPageLoad = true;
  document.addEventListener('astro:page-load', mountPendingMermaidDiagrams);
}
