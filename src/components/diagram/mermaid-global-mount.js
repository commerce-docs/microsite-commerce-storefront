/**
 * Single entry for mounting Mermaid diagrams. Loaded via `injectScript('page', …)` in
 * `astro.config.mjs` so Vite bundles this module with `mermaid-diagram.client` and `mermaid`.
 * Do not load this file with `import … ?url` — that emits only this file and leaves bare imports
 * that do not resolve on the CDN.
 */

if (typeof document === 'undefined') {
  throw new Error('[Diagram] mermaid-global-mount must only be imported in a browser context.');
}

async function mountPendingMermaidDiagrams() {
  const diagrams = [...document.querySelectorAll('.mermaid-diagram[data-pending-mermaid="true"]')]
    .filter((element) => element instanceof HTMLElement && element.id && !element.closest('#starlight__search'));
  if (!diagrams.length) return;

  let attachMermaidDiagramLifecycle;
  try {
    ({ attachMermaidDiagramLifecycle } = await import('./mermaid-diagram.client'));
  } catch (error) {
    console.error('[Diagram] Failed to load Mermaid renderer.', error);
    return;
  }

  for (const el of diagrams) {
    if (!el.isConnected || !el.hasAttribute('data-pending-mermaid')) continue;
    el.removeAttribute('data-pending-mermaid');
    attachMermaidDiagramLifecycle({ rootId: el.id });
  }
}

mountPendingMermaidDiagrams();

// Re-run on every Astro client navigation so freshly-swapped pages get their diagrams mounted.
document.addEventListener('astro:page-load', mountPendingMermaidDiagrams);
