/* ============================================================
   WORKS: BEHAVIOR
   ------------------------------------------------------------
   Everything here sits on top of a page of links. Without it,
   each tile jumps to its note further down the page.

   On wide screens the panel beside the tiles holds still and
   shows one note, a page at a time. At rest it shows About. On
   narrow screens a note opens whole under its tile, and About
   sits after the archive.

   Keys. Nothing on the page explains them.

     /                 find; Enter opens the first match, Esc clears
     j k, arrows       move between tiles and archive rows
     Enter             open the focused project
     ← →               turn the panel's pages while focus is in it
     Esc               return the panel to About
     shift-click       open the repository in a new tab
     shift-Enter       open the repository
     letters           jump to a title
     1 9 9 9           show the page as a plain list
   ============================================================ */

const $ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => root.querySelector<T>(s)!;
const $$ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => [...root.querySelectorAll<T>(s)];
const fill = (text: string, values: Record<string, string | number>) => text.replace(/\{(\w+)\}/g, (_, k) => String(values[k] ?? ''));

const root = document.documentElement;
const mast = $('[data-mast]');
const panel = $('[data-panel]');
const inner = $('[data-panel-inner]');
const archive = $('#archive');
const announce = $('[data-announce]');
const notes = new Map($$('[data-note]').map(n => [n.dataset.note!, n]));
const siteTitle = document.title;
const narrow = matchMedia('(max-width: 50.99rem)');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const smooth = (): ScrollBehavior => (reduceMotion.matches ? 'auto' : 'smooth');

let raw = false;

/* ---- masthead -------------------------------------------------------- */

// --mast-h keeps anchor jumps clear of the sticky masthead.
new ResizeObserver(() => root.style.setProperty('--mast-h', mast.offsetHeight + 'px')).observe(mast);

// A hairline appears once the page scrolls under the glass.
new IntersectionObserver(([entry]) => mast.classList.toggle('is-stuck', !entry.isIntersecting)).observe($('.mast-sentinel'));

/* ---- notes ----------------------------------------------------------- */

let current: string | null = null;
let item: HTMLElement | null = null;
let trigger: HTMLElement | null = null;

// The narrow screen's slot for a note under its tile or row.
const drop = document.createElement('li');
drop.className = 'drop';

const itemFor = (key: string) => document.querySelector<HTMLElement>(`[data-item="${key}"]`);
const linkFor = (key: string) => document.querySelector<HTMLAnchorElement>(`[data-item="${key}"] a[data-open]`);

// Puts the current note where it belongs and fits the panel's note to the window.
function place() {
  const key = current ?? 'about';
  const note = notes.get(key)!;
  const under = narrow.matches ? item : null;

  const stray = drop.firstElementChild;
  if (stray && stray !== note) inner.append(stray);

  if (under) {
    // After the last item in its row, so the row stays whole.
    const row = $$('[data-item]', under.parentElement!).filter(el => el.offsetTop === under.offsetTop);
    const last = row[row.length - 1];
    if (last.nextElementSibling !== drop) last.after(drop);
    if (note.parentElement !== drop) drop.append(note);
    unfit(note);
  } else {
    if (note.parentElement === drop) inner.append(note);
    drop.remove();
  }

  const shown = notes.get(under ? 'about' : key)!;
  notes.forEach(n => n.classList.toggle('is-shown', n === shown));
  fit(shown);
}

function mark() {
  $$('[data-item]').forEach(el => el.classList.toggle('is-current', el.dataset.item === current));
}

function open(key: string, from: HTMLElement | null = null) {
  const note = notes.get(key);
  if (!note) return;
  current = key;
  trigger = from;
  item = key === 'about' ? null : itemFor(key);
  mark();
  place();
  turn(0);
  sync();

  const title = note.dataset.title!;
  document.title = `${title} · ${siteTitle}`;
  announce.textContent = title;
  $('.note-title', note).focus({ preventScroll: true });
  if (narrow.matches) (item ? drop : note).scrollIntoView({ block: item ? 'nearest' : 'start', behavior: smooth() });
  else item?.scrollIntoView({ block: 'nearest', behavior: smooth() });
}

// No close button: the open tile again, Esc or About returns the panel to About.
function close(refocus = true) {
  const back = trigger ?? (current ? linkFor(current) : null);
  current = null;
  item = null;
  trigger = null;
  mark();
  place();
  turn(0);
  sync();
  document.title = siteTitle;
  if (!refocus || !back) return;
  back.focus({ preventScroll: true });
  if (narrow.matches) back.closest('[data-item]')?.scrollIntoView({ block: 'nearest' });
}

// Fetch a note's thumbnail before it is needed, so the note opens on a picture.
function warm(key?: string) {
  if (narrow.matches || !key) return;
  const img = notes.get(key)?.querySelector<HTMLImageElement>('.note-thumb img');
  if (img && img.loading !== 'eager') img.loading = 'eager';
}

for (const type of ['pointerover', 'focusin']) {
  document.addEventListener(type, event => {
    if ((event as PointerEvent).pointerType === 'touch') return;
    warm((event.target as Element).closest<HTMLElement>('[data-item]')?.dataset.item);
  });
}

/* ---- pages ----------------------------------------------------------- */

// On wide screens the panel never scrolls. A note turns in pages: Overview,
// Details and Take, or About's sections. A page taller than the window hands
// its last blocks to a continuation page; Overview drops its thumbnail instead.

const pager = $('[data-pager]');
const pagerLabel = $('[data-pager-label]');
const prevPage = $<HTMLButtonElement>('[data-turn="-1"]');
const nextPage = $<HTMLButtonElement>('[data-turn="1"]');
let page = 0;

const pagesOf = (note: Element) => $$(':scope > .pg', note);
const shownNote = () => $('.note.is-shown', inner);
const overflows = () => inner.scrollHeight > inner.clientHeight + 1;

function show(note: Element, i: number) {
  pagesOf(note).forEach((p, n) => p.classList.toggle('is-page', n === i));
}

// A blank page of the same kind, with the same running title.
function blankPage(like: HTMLElement, label: string) {
  const pg = document.createElement('section');
  pg.className = like.className.replace(/\s*\bis-page\b/, '');
  pg.tabIndex = -1;
  pg.dataset.label = label;
  const head = like.querySelector('.pg-head');
  if (head) pg.append(head.cloneNode(true));
  return pg;
}

// About's text arrives as one block. Each of its headings starts a page.
$$('.pg[data-split]').forEach(pg => {
  const head = pg.querySelector('.pg-head');
  const sections: HTMLElement[] = [];
  for (const el of [...pg.children]) {
    if (el === head) continue;
    if (el.tagName === 'H2' || !sections.length) sections.push(blankPage(pg, el.tagName === 'H2' ? el.textContent!.trim() : pg.dataset.label!));
    if (el.tagName === 'H2') el.classList.add('pg-title');
    sections[sections.length - 1].append(el);
  }
  pg.replaceWith(...sections);
});

// Continuation pages rejoin the page they came from, and the thumbnail comes back.
function unfit(note: Element) {
  $$(':scope > .pg[data-cont]', note).reverse().forEach(cont => {
    cont.previousElementSibling!.append(...[...cont.children].filter(el => !el.matches('.pg-head')));
    cont.remove();
  });
  note.querySelector('.note-thumb')?.classList.remove('is-dropped');
}

function fit(note: HTMLElement) {
  unfit(note);
  if (narrow.matches) return;
  for (let i = 0; i < pagesOf(note).length; i++) {
    const pg = pagesOf(note)[i];
    show(note, i);
    if (i === 0) {
      if (overflows()) pg.querySelector('.note-thumb')?.classList.add('is-dropped');
      continue;
    }
    let rest: HTMLElement | null = null;
    while (overflows()) {
      const blocks = [...pg.children].filter(el => !el.matches('.pg-head, .pg-title'));
      if (blocks.length < 2) break;
      if (!rest) {
        const base = pg.dataset.base ?? pg.dataset.label!;
        rest = blankPage(pg, fill(pagerLabel.dataset.continued!, { label: base }));
        rest.dataset.base = base;
        rest.dataset.cont = '';
        pg.after(rest);
      }
      const at = rest.querySelector('.pg-head');
      if (at) at.after(blocks[blocks.length - 1]);
      else rest.prepend(blocks[blocks.length - 1]);
    }
  }
}

function turn(to: number) {
  const pgs = pagesOf(shownNote());
  page = Math.max(0, Math.min(to, pgs.length - 1));
  show(shownNote(), page);
  pagerLabel.textContent = fill(pagerLabel.dataset.of!, { i: page + 1, n: pgs.length, label: pgs[page].dataset.label! });
  prevPage.disabled = page === 0;
  nextPage.disabled = page === pgs.length - 1;
  pager.classList.toggle('is-single', pgs.length < 2);
}

// Focus that was in the panel stays there, on the new page if its old place is gone.
function turnBy(step: number) {
  const had = panel.contains(document.activeElement);
  turn(page + step);
  const active = document.activeElement as HTMLButtonElement | null;
  if (had && (!active || !panel.contains(active) || active.closest('.pg:not(.is-page)') || active.disabled)) {
    pagesOf(shownNote())[page].focus({ preventScroll: true });
  }
}

// The window's height sets the pages, so a resize fits them again.
let frame = 0;
function refit() {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => { place(); turn(page); });
}
addEventListener('resize', refit);
new ResizeObserver(refit).observe(mast);
document.fonts.ready.then(refit);

/* ---- URL ------------------------------------------------------------- */

// ?p=<recordId> is the shared form. #record-<id> is what the page links to
// without JavaScript. ?p=this was the old index's own record.
function keyFromUrl() {
  const url = new URL(location.href);
  const key = url.hash.startsWith('#record-') ? url.hash.slice(8) : url.searchParams.get('p');
  return key === 'this' ? 'about' : key;
}

function urlFor(key: string | null) {
  const url = new URL(location.href);
  url.hash = '';
  if (key) url.searchParams.set('p', key);
  else url.searchParams.delete('p');
  return url;
}

const sync = () => history.replaceState(null, '', urlFor(current));

addEventListener('hashchange', () => {
  if (!location.hash.startsWith('#record-')) return;
  const key = keyFromUrl();
  if (key && notes.has(key)) open(key);
});

/* ---- links ----------------------------------------------------------- */

document.addEventListener('click', event => {
  if (raw || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey) return;
  const target = event.target as Element;

  const turner = target.closest<HTMLElement>('[data-turn]');
  if (turner) { turnBy(Number(turner.dataset.turn)); return; }

  const link = target.closest<HTMLAnchorElement>('a[data-open]');
  if (link) {
    // Shift-click a tile or a row and you get the repository instead.
    if (event.shiftKey) {
      if (link.dataset.repo) { event.preventDefault(); window.open(link.dataset.repo, '_blank', 'noopener'); }
      return;
    }
    event.preventDefault();
    const key = link.dataset.open!;

    // On wide screens About is the panel at rest, so About closes whatever is open.
    if (key === 'about' && !narrow.matches) {
      if (current) close(false);
      turn(0);
      $('#title-about').focus({ preventScroll: true });
      return;
    }

    if (current === key) close();
    else open(key, link);
    return;
  }

  if (event.shiftKey) return;

  // The wordmark returns the page to rest: About in the panel, no find, at the top.
  if (target.closest('[data-home]')) {
    event.preventDefault();
    closeFind();
    if (current) close(false);
    scrollTo({ top: 0, behavior: smooth() });
  }
});

/* ---- find ------------------------------------------------------------ */

const finder = $('[data-finder]');
const findInput = $<HTMLInputElement>('[data-find-input]');
const findCount = $('[data-find-count]');
const archiveHits = $('[data-archive-hits]');
const findable = $$('[data-item][data-find]');
let matches: HTMLElement[] = [];

function applyFind(query: string) {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  matches = findable.filter(el => words.every(w => el.dataset.find!.includes(w)));
  findable.forEach(el => el.classList.toggle('is-dim', words.length > 0 && !matches.includes(el)));
  const inArchive = matches.filter(el => archive.contains(el)).length;
  findCount.textContent = !words.length ? '' : matches.length ? fill(findCount.dataset.of!, { n: matches.length, total: findable.length }) : findCount.dataset.none!;
  archiveHits.textContent = words.length && inArchive ? fill(archiveHits.dataset.found!, { n: inArchive }) : '';
}

function openFind() {
  finder.hidden = false;
  findInput.focus();
  findInput.select();
}

function closeFind() {
  findInput.value = '';
  applyFind('');
  finder.hidden = true;
}

findInput.addEventListener('input', () => applyFind(findInput.value));
findInput.addEventListener('keydown', event => {
  const first = matches[0]?.querySelector<HTMLAnchorElement>('a[data-open]');
  if (event.key === 'Escape') {
    event.preventDefault();
    closeFind();
    $('#works').focus({ preventScroll: true });
  } else if (event.key === 'Enter' && first) {
    event.preventDefault();
    open(first.dataset.open!, first);
  } else if (event.key === 'ArrowDown' && first) {
    event.preventDefault();
    moveTo(first);
  }
});
findInput.addEventListener('blur', () => { if (!findInput.value.trim()) setTimeout(() => { if (document.activeElement !== findInput) finder.hidden = true; }, 0); });

/* ---- keyboard -------------------------------------------------------- */

// Tiles, then archive rows.
const walkable = () => $$<HTMLAnchorElement>('.tile-link, .row-link').filter(a => a.getClientRects().length > 0);
const titleOf = (a: HTMLAnchorElement) => (a.querySelector('.row-title') ?? a).textContent!.trim().toLowerCase();

function moveTo(link: HTMLAnchorElement) {
  link.focus({ preventScroll: true });
  link.closest('[data-item]')!.scrollIntoView({ block: 'nearest', behavior: smooth() });
}

let buffer = '';
let bufferTimer: ReturnType<typeof setTimeout>;

document.addEventListener('keydown', event => {
  if (raw || event.metaKey || event.ctrlKey || event.altKey) return;
  const target = event.target as HTMLElement;
  if (target.matches('input, textarea, select, [contenteditable]')) return;

  if (event.key === 'Escape') {
    if (current) { event.preventDefault(); close(); }
    return;
  }

  if (event.key === '/') { event.preventDefault(); openFind(); return; }

  if (!narrow.matches && panel.contains(target) && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
    event.preventDefault();
    turnBy(event.key === 'ArrowRight' ? 1 : -1);
    return;
  }

  const list = walkable();
  const onItem = list.indexOf(document.activeElement as HTMLAnchorElement);

  // From inside an open note, j and k carry on from its tile or row.
  const inNote = current && current !== 'about' && notes.get(current)!.contains(document.activeElement);
  const i = onItem >= 0 ? onItem : inNote ? list.indexOf(linkFor(current!)!) : -1;

  // Shift-Enter only opens a repository when a tile or row has focus.
  if (event.key === 'Enter' && event.shiftKey) {
    const repo = onItem >= 0 && list[onItem].dataset.repo;
    if (repo) { event.preventDefault(); location.href = repo; }
    return;
  }

  // j and k work from anywhere. Arrows only once a tile has focus, so they still scroll the page.
  let next: number | undefined;
  const forward = event.key === 'j' || (onItem >= 0 && (event.key === 'ArrowDown' || event.key === 'ArrowRight'));
  const back = event.key === 'k' || (onItem >= 0 && (event.key === 'ArrowUp' || event.key === 'ArrowLeft'));
  if (forward) next = (i + 1) % list.length;
  else if (back) next = i < 0 ? list.length - 1 : (i - 1 + list.length) % list.length;
  else if (onItem >= 0 && event.key === 'Home') next = 0;
  else if (onItem >= 0 && event.key === 'End') next = list.length - 1;
  if (next !== undefined && list[next]) { event.preventDefault(); moveTo(list[next]); return; }

  // Type-ahead. Digits are left alone so they can reach 1999 below.
  if (event.key.length === 1 && /\p{L}/u.test(event.key)) {
    buffer += event.key.toLowerCase();
    clearTimeout(bufferTimer);
    bufferTimer = setTimeout(() => (buffer = ''), 800);
    const titles = list.map(titleOf);
    let hit = titles.findIndex(t => t.startsWith(buffer));
    if (hit < 0) hit = titles.findIndex(t => t.includes(buffer));
    if (hit >= 0) { event.preventDefault(); moveTo(list[hit]); }
  }
});

/* ---- 1999: the page shows what it is underneath ---------------------- */

let year = '';
let yearTimer: ReturnType<typeof setTimeout>;

function nineteenNinetyNine() {
  raw = true;
  const list = [...notes.values()].filter(n => n.dataset.note !== 'about').map(n => ({
    title: n.dataset.title!,
    filed: $('.note-meta', n).textContent!.split(' · ').join(', '),
    href: n.querySelector<HTMLAnchorElement>('.note-links a')?.getAttribute('href'),
  }));
  document.querySelectorAll<HTMLStyleElement | HTMLLinkElement>('style, link[rel=stylesheet]').forEach(s => (s.disabled = true));
  const heading = document.createElement('h1');
  heading.textContent = siteTitle;
  const ul = document.createElement('ul');
  list.forEach(entry => {
    const li = document.createElement('li');
    if (entry.href) {
      const a = document.createElement('a');
      a.href = entry.href;
      a.textContent = entry.title;
      li.append(a);
    } else {
      li.append(entry.title);
    }
    li.append(' (' + entry.filed + ')');
    ul.append(li);
  });
  document.body.replaceChildren(heading, ul);
  setTimeout(restore, 5000);
  document.addEventListener('keydown', restore, { once: true });
  document.addEventListener('click', restore, { once: true });
}

// Reloading is the honest way back: replacing the body dropped every
// listener with it, and ?p= brings the same note back.
function restore() {
  if (raw) location.reload();
}

// No focus gate. On a fresh load nothing has focus yet, and an easter egg
// you have to click into first is not an easter egg.
document.addEventListener('keydown', event => {
  if (raw || event.metaKey || event.ctrlKey || event.altKey) return;
  if ((event.target as HTMLElement).matches('input, textarea')) return;
  if (event.key >= '0' && event.key <= '9') {
    year = (year + event.key).slice(-4);
    clearTimeout(yearTimer);
    yearTimer = setTimeout(() => (year = ''), 1200);
    if (year === '1999') { year = ''; nineteenNinetyNine(); }
  } else if (event.key.length === 1) {
    year = '';
  }
});

/* ---- load ------------------------------------------------------------ */

// A shared link opens on its note, with its tile at the top of the window.
const initial = keyFromUrl();
if (initial && notes.has(initial)) {
  open(initial);
  itemFor(initial)?.scrollIntoView({ block: 'start' });
} else {
  if (initial) history.replaceState(null, '', urlFor(null));
  place();
  turn(0);
}
