/* The masthead on every page that loads a script. */

const root = document.documentElement;
const mast = document.querySelector<HTMLElement>('[data-mast]')!;

// --mast-h keeps anchor jumps clear of the sticky masthead.
new ResizeObserver(() => root.style.setProperty('--mast-h', mast.offsetHeight + 'px')).observe(mast);

// A hairline appears once the page scrolls under the glass.
new IntersectionObserver(([entry]) => mast.classList.toggle('is-stuck', !entry.isIntersecting)).observe(document.querySelector('.mast-sentinel')!);

// The language menu, on trial in dev: a click outside or Esc closes it.
const menu = document.querySelector<HTMLDetailsElement>('.langs-menu');
if (menu) {
  document.addEventListener('click', event => { if (menu.open && !menu.contains(event.target as Node)) menu.open = false; });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !menu.open) return;
    menu.open = false;
    menu.querySelector('summary')!.focus();
  });
}
