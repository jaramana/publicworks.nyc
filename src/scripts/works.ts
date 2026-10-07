/* ============================================================
   WORKS: BEHAVIOR
   ------------------------------------------------------------
   Everything here sits on top of a page of links. Without it,
   each tile jumps to its note further down the page.

   On wide screens the panel beside the tiles shows one note,
   level with the tile or row that opened it. At rest it shows
   About. On narrow screens a note opens under its tile, and
   About sits after the archive.

   Keys. Nothing on the page explains them.

     /                 find; Enter opens the first match, Esc clears
     j k, arrows       move between tiles and archive rows
     Enter             open the focused project
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
const narrow = matchMedia('(max-width: 55.99rem)');
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
let at: HTMLElement | 'rest' | number = 'rest';

// The narrow screen's slot for a note under its tile or row.
const drop = document.createElement('li');
drop.className = 'drop';

const itemFor = (key: string) => document.querySelector<HTMLElement>(`[data-item="${key}"]`);
const linkFor = (key: string) => document.querySelector<HTMLAnchorElement>(`[data-item="${key}"] a[data-open]`);
const firstRow = () => $('.tile').getBoundingClientRect().top;

// Level with the top of the window, under the masthead, but never above the first row.
function viewSpot() {
  const top = panel.getBoundingClientRect().top;
  return Math.max(firstRow() - top, mast.getBoundingClientRect().bottom + 24 - top);
}

// Puts the current note where it belongs and shows it.
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
  } else {
    if (note.parentElement === drop) inner.append(note);
    drop.remove();
  }

  const shown = under ? 'about' : key;
  notes.forEach((n, k) => n.classList.toggle('is-shown', k === shown));
  anchor();
}

// The panel's note sits level with its tile or row and scrolls with the page.
// Near the bottom the panel grows, so the note never runs into the footer.
function anchor() {
  panel.style.minHeight = '';
  if (narrow.matches) return;
  const top = panel.getBoundingClientRect().top;
  const y = at === 'rest' ? firstRow() - top
    : typeof at === 'number' ? at
    : at.getBoundingClientRect().top - top;
  const need = y + inner.offsetHeight + 48;
  if (need > panel.offsetHeight) panel.style.minHeight = need + 'px';
  inner.style.setProperty('--y', Math.round(y) + 'px');
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
  at = item ?? viewSpot();
  mark();
  place();
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
  at = 'rest';
  mark();
  place();
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

let frame = 0;
addEventListener('resize', () => {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(place);
});
new ResizeObserver(anchor).observe(inner);
document.fonts.ready.then(anchor);

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

  const link = target.closest<HTMLAnchorElement>('a[data-open]');
  if (link) {
    // Shift-click a tile or a row and you get the repository instead.
    if (event.shiftKey) {
      if (link.dataset.repo) { event.preventDefault(); window.open(link.dataset.repo, '_blank', 'noopener'); }
      return;
    }
    event.preventDefault();
    const key = link.dataset.open!;
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
}

// The note glides between tiles only after it has found its first place.
requestAnimationFrame(() => requestAnimationFrame(() => panel.classList.add('is-ready')));
