/* The masthead on every page that loads a script. */

const root = document.documentElement;
const mast = document.querySelector<HTMLElement>('[data-mast]')!;

// --mast-h keeps anchor jumps clear of the sticky masthead.
new ResizeObserver(() => root.style.setProperty('--mast-h', mast.offsetHeight + 'px')).observe(mast);

// A hairline appears once the page scrolls under the glass.
new IntersectionObserver(([entry]) => mast.classList.toggle('is-stuck', !entry.isIntersecting)).observe(document.querySelector('.mast-sentinel')!);

// On a phone the nav folds behind a menu button. Esc, a tap outside the
// masthead, a tap on a link, or a window wide enough to show the nav folds it
// again. Open, the page underneath stops scrolling.
const toggle = mast.querySelector<HTMLButtonElement>('.nav-toggle');
const nav = mast.querySelector<HTMLElement>('.nav');
if (toggle && nav) {
  const wide = window.matchMedia('(min-width: 40.01rem)');
  const set = (open: boolean) => {
    if (open) nav.style.setProperty('--sheet-top', mast.getBoundingClientRect().bottom + 'px');
    toggle.setAttribute('aria-expanded', String(open));
    mast.classList.toggle('menu-open', open);
    root.classList.toggle('menu-locked', open);
  };
  toggle.addEventListener('click', () => set(toggle.getAttribute('aria-expanded') !== 'true'));
  mast.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mast.classList.contains('menu-open')) { set(false); toggle.focus(); }
  });
  document.addEventListener('click', event => {
    if (mast.classList.contains('menu-open') && !mast.contains(event.target as Node)) set(false);
  });
  nav.addEventListener('click', event => { if ((event.target as Element).closest('a')) set(false); });
  wide.addEventListener('change', () => { if (wide.matches) set(false); });
}

// The language menu: a click outside or Esc closes it.
const menu = document.querySelector<HTMLDetailsElement>('.langs-menu');
if (menu) {
  document.addEventListener('click', event => { if (menu.open && !menu.contains(event.target as Node)) menu.open = false; });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !menu.open) return;
    menu.open = false;
    menu.querySelector('summary')!.focus();
  });
}
