// Copies a heading's permalink to the clipboard when its Starlight anchor link
// (`a.sl-anchor-link`, rendered by AnchorHeading.astro) is clicked. The default
// hash navigation still runs, so the URL bar updates and the page scrolls to the
// heading as before; this only adds the copy that readers expect from the icon.

let feedbackEl: HTMLElement | null = null;
let feedbackTimer: number | undefined;

async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Fallback for older browsers or insecure (non-HTTPS) contexts where the
    // async Clipboard API is unavailable.
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
    } catch {
      /* nothing more we can do */
    }
    textarea.remove();
  }
}

function showCopiedFeedback(anchor: HTMLElement): void {
  if (!feedbackEl) {
    feedbackEl = document.createElement('span');
    feedbackEl.className = 'anchor-link-copied';
    feedbackEl.setAttribute('role', 'status');
    document.body.appendChild(feedbackEl);
  }

  feedbackEl.textContent = 'Copied!';
  const rect = anchor.getBoundingClientRect();
  feedbackEl.style.top = `${window.scrollY + rect.top}px`;
  feedbackEl.style.left = `${window.scrollX + rect.right + 8}px`;

  // Restart the fade so rapid clicks re-trigger it.
  feedbackEl.classList.remove('is-visible');
  void feedbackEl.offsetWidth;
  feedbackEl.classList.add('is-visible');

  window.clearTimeout(feedbackTimer);
  feedbackTimer = window.setTimeout(() => {
    feedbackEl?.classList.remove('is-visible');
  }, 1200);
}

// Advertise the copy affordance before the click with a hover tooltip. The icon
// looks like a plain link, so without this a reader has no cue that it copies.
// The accessible label Starlight sets (section navigation) is left intact, since
// the element is still a real navigating link for keyboard and screen-reader use.
function annotateAnchors(): void {
  const anchors = document.querySelectorAll<HTMLAnchorElement>(
    'a.sl-anchor-link:not([data-copy-annotated])',
  );
  anchors.forEach((anchor) => {
    anchor.dataset.copyAnnotated = '';
    anchor.title = 'Copy link';
  });
}

function initAnchorLinkCopy(): void {
  // Delegate on document so a single listener survives Starlight's client-side
  // navigation, and guard against double-binding when the module re-evaluates.
  if ((window as unknown as { __anchorLinkCopyInit?: boolean }).__anchorLinkCopyInit) return;
  (window as unknown as { __anchorLinkCopyInit?: boolean }).__anchorLinkCopyInit = true;

  document.addEventListener('click', (event) => {
    const target = event.target as Element | null;
    const anchor = target?.closest?.('a.sl-anchor-link') as HTMLAnchorElement | null;
    if (!anchor) return;
    // `anchor.href` is the absolute URL including the `#id`, ready to share.
    void copyToClipboard(anchor.href);
    showCopiedFeedback(anchor);
  });

  annotateAnchors();
  // Re-annotate after Starlight client-side navigations swap in new content.
  document.addEventListener('astro:page-load', annotateAnchors);
}

initAnchorLinkCopy();
