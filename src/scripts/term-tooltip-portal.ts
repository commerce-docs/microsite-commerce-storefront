/**
 * Moves Term glossary tooltips to document.body while visible so overflow on
 * tables does not clip them. Tooltips use display:none when hidden, so they
 * have no box and never affect any ancestor's scroll area.
 */
const VISIBLE = 'term__tooltip--visible';
const BOUND_ATTR = 'data-term-portal-bound';

let activeTerm: Element | null = null;
let activeTip: HTMLElement | null = null;

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

function hideActive() {
  if (!activeTip) return;
  activeTip.classList.remove(VISIBLE);
  const tip = activeTip;
  // '' removes each inline override; CSS display:none takes over immediately,
  // which also cancels any in-progress opacity transition.
  Object.assign(tip.style, { display: '', position: '', zIndex: '', left: '', top: '', transform: '' });
  if (tip.parentElement === document.body) {
    if (activeTerm?.isConnected) activeTerm.appendChild(tip);
    else tip.remove();
  }
  activeTerm = activeTip = null;
}

function showForTerm(term: Element) {
  const tip = term.querySelector<HTMLElement>('.term__tooltip');
  if (!tip) return;
  if (activeTerm !== term) hideActive();

  activeTerm = term;
  activeTip = tip;
  document.body.appendChild(tip);

  const r = term.getBoundingClientRect();
  const m = 8, gap = 7, vw = window.innerWidth, vh = window.innerHeight;

  // Set display:block so the tip has a box for measurement, then position it.
  Object.assign(tip.style, { display: 'block', position: 'fixed', zIndex: '2147483646', left: '0', top: '0', transform: 'none' });
  const tr = tip.getBoundingClientRect();
  const left = clamp(r.left + r.width / 2 - tr.width / 2, m, vw - tr.width - m);
  let top = r.bottom + gap;
  if (top + tr.height > vh - m) top = r.top - tr.height - gap;
  top = clamp(top, m, vh - tr.height - m);
  tip.style.left = `${left}px`;
  tip.style.top = `${top}px`;

  // Add VISIBLE one frame after display:block so the opacity transition plays.
  requestAnimationFrame(() => { if (activeTip === tip) tip.classList.add(VISIBLE); });
}

function bindTerm(term: Element) {
  const el = term as HTMLElement;
  if (el.dataset.termPortalBound === '1') return;
  el.dataset.termPortalBound = '1';

  const show = () => showForTerm(term);
  const leave = (e: Event) => {
    const next = (e as MouseEvent | FocusEvent).relatedTarget as Node | null;
    if (!next || !term.contains(next)) {
      if (activeTerm === term) hideActive();
    }
  };

  term.addEventListener('mouseenter', show);
  term.addEventListener('mouseleave', leave);
  term.addEventListener('focusin', show);
  term.addEventListener('focusout', leave);
}

document.documentElement.classList.add('term-portal-ready');

// Hide (not reposition) on scroll or resize — standard tooltip behaviour and
// avoids any scroll-event feedback loop with overflow containers.
window.addEventListener('scroll', hideActive, { capture: true, passive: true });
window.addEventListener('resize', hideActive, { passive: true });
document.addEventListener('visibilitychange', () => { if (document.hidden) hideActive(); });

const UNBOUND = `.term:not([${BOUND_ATTR}="1"])`;
document.querySelectorAll(UNBOUND).forEach(bindTerm);

document.addEventListener('astro:page-load', () => {
  hideActive();
  document.querySelectorAll(UNBOUND).forEach(bindTerm);
});
