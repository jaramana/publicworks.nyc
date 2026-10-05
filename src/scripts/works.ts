/* ============================================================
   WORKS: BEHAVIOR
   ------------------------------------------------------------
   Everything here sits on top of a page of links. Without it,
   each tile jumps to its record further down the page.

   Keys. Nothing on the page explains them.

     /                 find; Enter opens the first match, Esc clears
     j k, arrows       move between tiles and open archive rows
     Enter             open the focused project
     ← →               previous and next inside the panel
     Esc               close the panel
     shift-click       open the repository in a new tab
     shift-Enter       open the repository
     letters           jump to a title
     1 9 9 9           show the page as a plain list
   ============================================================ */

const $ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => root.querySelector<T>(s)!;
const $$ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => [...root.querySelectorAll<T>(s)];
const fill = (text: string, values: Record<string, string | number>) => text.replace(/\{(\w+)\}/g, (_, k) => String(values[k] ?? ''));

const panel = $<HTMLDialogElement>('[data-panel]');
const panelName = $('[data-panel-name]');
const prevButton = $<HTMLButtonElement>('[data-panel-prev]');
const nextButton = $<HTMLButtonElement>('[data-panel-next]');
const drawer = $<HTMLDetailsElement>('[data-drawer]');
const announce = $('[data-announce]');
const records = $$('[data-record]');
const byKey = new Map(records.map(r => [r.dataset.record!, r]));
const siteTitle = document.title;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const touch = matchMedia('(hover: none)');

// Records step within their own group: works with works, archive with archive.
const groups = new Map<string, string[]>();
records.forEach(r => {
  const list = groups.get(r.dataset.group!) ?? [];
  list.push(r.dataset.record!);
  groups.set(r.dataset.group!, list);
});

let current: string | null = null;
let openedByPush = false;
let raw = false;

/* ---- spot: the color of the project in focus ------------------------ */

const accentOf = (key?: string | null) => (key ? byKey.get(key)?.dataset.accent : undefined);

function setSpot(accent?: string) {
  if (accent) document.body.style.setProperty('--spot', accent);
  else document.body.style.removeProperty('--spot');
}

function spotFrom(el: Element | null) {
  if (panel.open || raw) return;
  const tile = el?.closest<HTMLElement>('[data-tile]');
  setSpot(accentOf(tile?.dataset.tile));
}

// Fetch the panel's cover before it is needed, so the panel opens on a picture.
function warm(key?: string) {
  const img = key && byKey.get(key)?.querySelector<HTMLImageElement>('.record-cover img');
  if (img && img.loading !== 'eager') img.loading = 'eager';
}

let hovered: Element | null = null;
document.addEventListener('pointerover', event => {
  if (event.pointerType === 'touch') return;
  const target = event.target as Element;
  const tile = target.closest<HTMLElement>('[data-tile]');
  if (tile === hovered) return;
  hovered = tile;
  if (tile) { spotFrom(tile); warm(tile.dataset.tile); }
  else if (!target.closest('.grid, .rows')) spotFrom(document.activeElement);
});
document.addEventListener('focusin', event => {
  const tile = (event.target as Element).closest<HTMLElement>('[data-tile]');
  if (tile) warm(tile.dataset.tile);
  spotFrom(tile ?? hovered);
});

// On a touch screen the tile nearest the middle of the screen lights.
let lit: HTMLElement | null = null;
function light(tile: HTMLElement | null) {
  if (tile === lit) return;
  lit?.classList.remove('is-lit');
  lit = tile;
  lit?.classList.add('is-lit');
  spotFrom(lit);
}
const middle = new IntersectionObserver(entries => {
  if (!touch.matches) return;
  const hit = entries.filter(e => e.isIntersecting).pop();
  if (hit) light(hit.target as HTMLElement);
  else if (entries.some(e => e.target === lit && !e.isIntersecting)) light(null);
}, { rootMargin: '-45% 0px -45% 0px' });
$$('.tile[data-tile]').forEach(tile => middle.observe(tile));
touch.addEventListener('change', () => { if (!touch.matches) light(null); });

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

/* ---- panel ----------------------------------------------------------- */

function show(key: string, focusTitle = false) {
  const record = byKey.get(key);
  if (!record) return;

  // Focus inside the record about to hide moves to the new title.
  const stale = records.some(r => r !== record && r.contains(document.activeElement));
  records.forEach(r => (r.hidden = r !== record));
  current = key;

  const title = record.dataset.title!;
  const list = groups.get(record.dataset.group!)!;
  const i = list.indexOf(key);
  const single = list.length < 2;
  prevButton.hidden = nextButton.hidden = single;
  prevButton.disabled = i <= 0;
  nextButton.disabled = i >= list.length - 1;
  panelName.textContent = title;
  document.title = `${title} · ${siteTitle}`;
  setSpot(record.dataset.accent);

  if (!panel.open) panel.showModal();
  panel.scrollTop = 0;
  if (focusTitle || stale || !panel.contains(document.activeElement)) $('.record-title', record).focus({ preventScroll: true });
  announce.textContent = title;
}

// The cover grows from the tile into the panel where the browser supports it.
function openWithTransition(key: string, from?: Element) {
  const start = (document as Document & { startViewTransition?: (cb: () => unknown) => { ready: Promise<void>; finished: Promise<void> } }).startViewTransition;
  const tileImg = from?.closest('.tile')?.querySelector<HTMLImageElement>('.tile-media img');
  const panelImg = byKey.get(key)?.querySelector<HTMLImageElement>('.record-cover img');
  if (!start || !tileImg || !panelImg || reduceMotion.matches || panel.open || document.hidden) return show(key, true);

  warm(key);
  tileImg.style.viewTransitionName = 'cover';
  panel.classList.add('no-anim');
  const transition = start.call(document, async () => {
    tileImg.style.viewTransitionName = '';
    panelImg.style.viewTransitionName = 'cover';
    show(key, true);
    await Promise.race([panelImg.decode().catch(() => {}), new Promise(r => setTimeout(r, 350))]);
  });
  // The browser may skip the animation. The panel still opens, so a skip is not an error.
  transition.ready.catch(() => {});
  transition.finished.catch(() => {}).finally(() => {
    panelImg.style.viewTransitionName = '';
    panel.classList.remove('no-anim');
  });
}

function open(key: string, from?: Element) {
  if (!byKey.has(key)) return;
  if (panel.open) {
    history.replaceState({ p: key }, '', urlFor(key));
    show(key, true);
    return;
  }
  history.pushState({ p: key }, '', urlFor(key));
  openedByPush = true;
  openWithTransition(key, from);
}

function step(direction: -1 | 1) {
  if (!current) return false;
  const list = groups.get(byKey.get(current)!.dataset.group!)!;
  const key = list[list.indexOf(current) + direction];
  if (!key) return false;
  history.replaceState({ p: key }, '', urlFor(key));
  show(key);
  return true;
}

// Focus goes back to whatever opens the record: its tile, its archive row, or the About link.
function returnFocus(key: string | null) {
  const trigger = key && $$<HTMLAnchorElement>(`main [data-open="${key}"], .masthead [data-open="${key}"]`)[0];
  if (!trigger) return;
  if (drawer.contains(trigger)) drawer.open = true;
  trigger.focus({ preventScroll: true });
  trigger.closest('[data-tile]')?.scrollIntoView({ block: 'nearest' });
}

// Every way of closing ends here: the button, Esc, the backdrop, Back.
panel.addEventListener('close', () => {
  if (raw) return;
  const key = current;
  current = null;
  if (keyFromUrl()) {
    if (openedByPush) history.back();
    else history.replaceState(null, '', urlFor(null));
  }
  openedByPush = false;
  document.title = siteTitle;
  setSpot();
  returnFocus(key);
});

$('[data-panel-close]').addEventListener('click', () => panel.close());
prevButton.addEventListener('click', () => step(-1));
nextButton.addEventListener('click', () => step(1));

// A click on the dimmed page beside the panel closes it.
panel.addEventListener('click', event => {
  if (event.target !== panel) return;
  const box = panel.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) panel.close();
});

addEventListener('popstate', () => {
  const key = keyFromUrl();
  if (key && byKey.has(key)) {
    openedByPush = !!history.state?.p;
    show(key);
  } else if (panel.open) {
    panel.close();
  }
});

addEventListener('hashchange', () => {
  const key = keyFromUrl();
  if (key && byKey.has(key)) {
    history.replaceState({ p: key }, '', urlFor(key));
    show(key, true);
  }
});

/* ---- links ----------------------------------------------------------- */

document.addEventListener('click', event => {
  if (raw || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey) return;
  const target = event.target as Element;

  const link = target.closest<HTMLAnchorElement>('a[data-open], a[data-step]');
  if (link) {
    // Shift-click a tile or a row and you get the repository instead.
    if (event.shiftKey) {
      if (link.dataset.repo) { event.preventDefault(); window.open(link.dataset.repo, '_blank', 'noopener'); }
      return;
    }
    event.preventDefault();
    if (link.dataset.step) {
      history.replaceState({ p: link.dataset.step }, '', urlFor(link.dataset.step));
      show(link.dataset.step, true);
    } else {
      open(link.dataset.open!, link);
    }
    return;
  }

  if (event.shiftKey) return;

  if (target.closest('[data-archive-link]')) {
    event.preventDefault();
    drawer.open = true;
    $('#archive').scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    $('summary', drawer).focus({ preventScroll: true });
    return;
  }

  // The wordmark returns the page to rest: no panel, no find, at the top.
  if (target.closest('[data-home]')) {
    event.preventDefault();
    closeFind();
    scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  }
});

/* ---- find ------------------------------------------------------------ */

const finder = $('[data-finder]');
const findInput = $<HTMLInputElement>('[data-find-input]');
const findCount = $('[data-find-count]');
const archiveHits = $('[data-archive-hits]');
const findable = $$('[data-tile][data-find]');
let matches: HTMLElement[] = [];

function applyFind(query: string) {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  matches = findable.filter(el => words.every(w => el.dataset.find!.includes(w)));
  findable.forEach(el => el.classList.toggle('is-dim', words.length > 0 && !matches.includes(el)));
  const inArchive = matches.filter(el => drawer.contains(el)).length;
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
    if (drawer.contains(first)) drawer.open = true;
    open(first.dataset.open!, first);
  } else if (event.key === 'ArrowDown' && first) {
    event.preventDefault();
    if (drawer.contains(first)) drawer.open = true;
    moveTo(first);
  }
});
findInput.addEventListener('blur', () => { if (!findInput.value.trim()) setTimeout(() => { if (document.activeElement !== findInput) finder.hidden = true; }, 0); });

/* ---- keyboard -------------------------------------------------------- */

// Tiles, then archive rows when the drawer is open.
const walkable = () => $$<HTMLAnchorElement>('.tile-link, .row-link').filter(a => a.getClientRects().length > 0);

function moveTo(link: HTMLAnchorElement) {
  link.focus({ preventScroll: true });
  link.closest('[data-tile]')!.scrollIntoView({ block: 'nearest', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
}

let buffer = '';
let bufferTimer: ReturnType<typeof setTimeout>;

document.addEventListener('keydown', event => {
  if (raw || event.metaKey || event.ctrlKey || event.altKey) return;
  const target = event.target as HTMLElement;
  if (target.matches('input, textarea, select, [contenteditable]')) return;

  if (panel.open) {
    if (event.key === 'ArrowLeft' && step(-1)) event.preventDefault();
    if (event.key === 'ArrowRight' && step(1)) event.preventDefault();
    return;
  }

  if (event.key === '/') { event.preventDefault(); openFind(); return; }

  const list = walkable();
  const i = list.indexOf(document.activeElement as HTMLAnchorElement);

  // Shift-Enter only opens a repository when a tile or row has focus.
  if (event.key === 'Enter' && event.shiftKey) {
    const repo = i >= 0 && list[i].dataset.repo;
    if (repo) { event.preventDefault(); location.href = repo; }
    return;
  }

  // j and k work from anywhere. Arrows only once a tile has focus, so they still scroll the page.
  let next: number | undefined;
  const forward = event.key === 'j' || (i >= 0 && (event.key === 'ArrowDown' || event.key === 'ArrowRight'));
  const back = event.key === 'k' || (i >= 0 && (event.key === 'ArrowUp' || event.key === 'ArrowLeft'));
  if (forward) next = (i + 1) % list.length;
  else if (back) next = i < 0 ? list.length - 1 : (i - 1 + list.length) % list.length;
  else if (i >= 0 && event.key === 'Home') next = 0;
  else if (i >= 0 && event.key === 'End') next = list.length - 1;
  if (next !== undefined && list[next]) { event.preventDefault(); moveTo(list[next]); return; }

  // Type-ahead. Digits are left alone so they can reach 1999 below.
  if (event.key.length === 1 && /\p{L}/u.test(event.key)) {
    buffer += event.key.toLowerCase();
    clearTimeout(bufferTimer);
    bufferTimer = setTimeout(() => (buffer = ''), 800);
    const titles = list.map(a => a.textContent!.trim().toLowerCase());
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
  const list = records.filter(r => r.dataset.group !== 'about').map(r => ({
    title: r.dataset.title!,
    filed: $('.meta', r).childNodes[0].textContent!.split(' · ').join(', '),
    href: r.querySelector<HTMLAnchorElement>('.record-links a')?.getAttribute('href'),
  }));
  document.querySelectorAll<HTMLStyleElement | HTMLLinkElement>('style, link[rel=stylesheet]').forEach(s => (s.disabled = true));
  const heading = document.createElement('h1');
  heading.textContent = siteTitle;
  const ul = document.createElement('ul');
  list.forEach(item => {
    const li = document.createElement('li');
    if (item.href) {
      const a = document.createElement('a');
      a.href = item.href;
      a.textContent = item.title;
      li.append(a);
    } else {
      li.append(item.title);
    }
    li.append(' (' + item.filed + ')');
    ul.append(li);
  });
  document.body.replaceChildren(heading, ul);
  setTimeout(restore, 5000);
  document.addEventListener('keydown', restore, { once: true });
  document.addEventListener('click', restore, { once: true });
}

// Reloading is the honest way back: replacing the body dropped every
// listener with it, and ?p= brings the same record back.
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

/* ---- print and load ------------------------------------------------- */

// Print lists the archive too, so the drawer opens for it and closes after.
let drawerWasOpen = false;
addEventListener('beforeprint', () => { drawerWasOpen = drawer.open; drawer.open = true; });
addEventListener('afterprint', () => { drawer.open = drawerWasOpen; });

// A shared link opens on its record. The title takes focus without a ring,
// and the status line announces it.
const initial = keyFromUrl();
if (initial && byKey.has(initial)) {
  history.replaceState({ p: initial }, '', urlFor(initial));
  show(initial, true);
} else if (initial) {
  history.replaceState(null, '', urlFor(null));
}
