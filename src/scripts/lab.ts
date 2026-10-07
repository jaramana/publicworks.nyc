/* ============================================================
   LAB: BEHAVIOR
   ------------------------------------------------------------
   Every study shows the same note. Only where it appears changes.
   On narrow screens, Side and Margin fall back to Card. About has
   no item to sit beside, so Inline and Margin show it as a card.
   ============================================================ */

const $ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => root.querySelector<T>(s)!;
const $$ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => [...root.querySelectorAll<T>(s)];

const root = document.documentElement;
const study = Number(root.dataset.study ?? 1);
const narrow = matchMedia('(max-width: 55.99rem)');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const notes = new Map($$('[data-note]').map(n => [n.dataset.note!, n]));
const active = () => (narrow.matches && (study === 2 || study === 5) ? 1 : study);
const smooth = (): ScrollBehavior => (reduceMotion.matches ? 'auto' : 'smooth');

/* ---- lab bar ----------------------------------------------------------- */

function hrefWith(key: string, value: string | null) {
  const url = new URL(location.href);
  if (value) url.searchParams.set(key, value);
  else url.searchParams.delete(key);
  url.hash = '';
  return url.href;
}

const variant = root.dataset.variant ?? 'anchored';
const variantKeys: Record<string, string> = { f: 'fit', a: 'anchored', p: 'pages' };

function sideHref(v: string) {
  const url = new URL(location.href);
  url.searchParams.set('s', '2');
  url.searchParams.set('v', v);
  url.hash = '';
  return url.href;
}

$$<HTMLAnchorElement>('[data-study-link]').forEach(a => {
  a.href = hrefWith('s', a.dataset.studyLink!);
  if (Number(a.dataset.studyLink) === study) a.setAttribute('aria-current', 'page');
});
$$<HTMLAnchorElement>('[data-variant-link]').forEach(a => {
  a.href = sideHref(a.dataset.variantLink!);
  if (study === 2 && a.dataset.variantLink === variant) a.setAttribute('aria-current', 'page');
});
const cols = root.dataset.cols ?? 'auto';
$$<HTMLAnchorElement>('[data-cols-link]').forEach(a => {
  a.href = hrefWith('cols', a.dataset.colsLink!);
  if (a.dataset.colsLink === cols) a.setAttribute('aria-current', 'page');
});
$$('.lab-note').forEach(p => (p.hidden = p.dataset.for !== (study === 2 ? 'side-' + variant : String(study))));
const dark = root.dataset.theme === 'dark';
const themeLink = $<HTMLAnchorElement>('[data-theme-link]');
themeLink.textContent = dark ? 'Light' : 'Dark';
themeLink.href = hrefWith('theme', dark ? null : 'dark');

document.addEventListener('keydown', event => {
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  if (event.target instanceof Element && event.target.matches('input, textarea')) return;
  if (/^[1-6]$/.test(event.key)) location.href = hrefWith('s', event.key);
  if (variantKeys[event.key]) location.href = sideHref(variantKeys[event.key]);
});

/* ---- masthead ---------------------------------------------------------- */

// The lab bar and the glass masthead stick together. --mast-h is the bottom
// of that stack, which the side panel, the drawer and anchor jumps start below.
const mast = $('.mast');
const labBar = $('.lab-bar');
const measureStack = () => {
  root.style.setProperty('--lab-h', labBar.offsetHeight + 'px');
  root.style.setProperty('--mast-h', labBar.offsetHeight + mast.offsetHeight + 'px');
};
const stack = new ResizeObserver(measureStack);
stack.observe(mast);
stack.observe(labBar);
new IntersectionObserver(([entry]) => mast.classList.toggle('is-stuck', !entry.isIntersecting)).observe($('.mast-sentinel'));

// The drawer starts where the masthead ends, which moves while the lab bar is in view.
let mastFrame = 0;
const trackMast = () => {
  cancelAnimationFrame(mastFrame);
  mastFrame = requestAnimationFrame(() => root.style.setProperty('--mast-bottom', Math.max(0, mast.getBoundingClientRect().bottom) + 'px'));
};
addEventListener('scroll', trackMast, { passive: true });
addEventListener('resize', trackMast);
trackMast();

/* ---- shared ------------------------------------------------------------ */

let current: string | null = null;
let trigger: HTMLElement | null = null;
let openStudy: Study | null = null;

// A copy of the note, without ids, so it can sit anywhere.
function copy(key: string, openMore = false) {
  const note = notes.get(key)!.cloneNode(true) as HTMLElement;
  [note, ...$$('[id]', note)].forEach(el => el.removeAttribute('id'));
  if (openMore) $('details', note).open = true;
  return note;
}

function mark(key: string | null) {
  $$('[data-item]').forEach(el => el.classList.toggle('is-current', el.dataset.item === key));
}

function focusTitle(note: Element) {
  $('.note-title', note).focus({ preventScroll: true });
}

// Every close ends here.
function done() {
  const from = trigger;
  current = null;
  trigger = null;
  openStudy = null;
  mark(null);
  from?.focus({ preventScroll: true });
}

type Study = { open(key: string, from: HTMLElement): void; close(): void; toggles: boolean };

/* ---- 1 card ------------------------------------------------------------ */

const card = $<HTMLDialogElement>('[data-card]');
const cardStudy: Study = {
  toggles: false,
  open(key) {
    const note = copy(key);
    $('[data-slot]', card).replaceChildren(note);
    if (!card.open) card.showModal();
    card.scrollTop = 0;
    focusTitle(note);
  },
  close() {
    if (card.open) card.close();
  },
};
card.addEventListener('close', done);
card.addEventListener('click', event => {
  if (event.target !== card) return;
  const box = card.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) card.close();
});

/* ---- 2 side ------------------------------------------------------------ */

// The column never scrolls on its own. Fit trims the note to what always
// fits, Anchored lets it ride with the page beside its tile, and Pages
// splits it into screens the column can hold. At rest it shows About.
const side = $('[data-side]');
const sideInner = $('[data-side-inner]');
const sideSlot = $('[data-slot]', side);
// Every note shows the same spec rows, in this order, where the record has them.
const specRows: Record<string, string[]> = { fit: ['Built with', 'Updated'], anchored: ['Data', 'Built with', 'Updated'] };

function keepSpecs(note: HTMLElement, labels: string[]) {
  const dl = note.querySelector('.note-specs');
  if (!dl) return;
  const rows = new Map($$('dt', dl).map(dt => [dt.textContent!.trim(), [dt, dt.nextElementSibling!]]));
  dl.replaceChildren(...labels.flatMap(label => rows.get(label) ?? []));
  if (!dl.children.length) dl.remove();
}

// A work's take replaces the generic write-up. Until it is written, a marked placeholder holds its place.
function addTake(note: HTMLElement) {
  if (note.dataset.status !== 'works') return;
  const take = document.createElement('div');
  take.className = 'note-take';
  const label = document.createElement('p');
  label.className = 'note-take-label';
  label.textContent = 'Take';
  const text = document.createElement('p');
  text.className = 'note-take-text is-placeholder';
  text.textContent = `Your take on ${$('.note-title', note).textContent} goes here: one short paragraph, in your own words.`;
  take.append(label, text);
  $('.note-side', note).append(take);
}

function sideNote(key: string) {
  const note = copy(key);
  if (key !== 'about' && specRows[variant]) {
    $$('.more', note).forEach(el => el.remove());
    keepSpecs(note, specRows[variant]);
    if (variant === 'anchored') addTake(note);
  }
  return variant === 'pages' ? paginate(note) : note;
}

function showSide(key: string, place: HTMLElement | 'rest' | 'view') {
  const note = sideNote(key);
  sideSlot.replaceChildren(note);
  if (variant === 'pages') fitPages(note);
  if (variant === 'anchored') {
    const top = side.getBoundingClientRect().top;
    anchoredTo = place === 'view' ? Math.max(firstRow() - top, mast.getBoundingClientRect().bottom + 24 - top) : place;
    anchor();
    $$<HTMLDetailsElement>('details', note).forEach(d => d.addEventListener('toggle', anchor));
  }
  return note;
}

const sideRest = () => showSide('about', 'rest');

// No close button: the open tile again, Esc or About returns the column to About.
const sideStudy: Study = {
  toggles: true,
  open(key, from) {
    focusTitle(showSide(key, from.closest<HTMLElement>('[data-item]') ?? 'view'));
  },
  close() {
    sideRest();
    done();
  },
};

/* Anchored: the note sits level with its tile and scrolls with the page. */

let anchoredTo: HTMLElement | 'rest' | number = 'rest';
const firstRow = () => $('.tile').getBoundingClientRect().top;

function anchor() {
  const top = side.getBoundingClientRect().top;
  const y = anchoredTo === 'rest' ? firstRow() - top
    : typeof anchoredTo === 'number' ? anchoredTo
    : anchoredTo.getBoundingClientRect().top - top;

  // A note near the bottom makes the page longer rather than overlap the footer.
  side.style.minHeight = '';
  const need = y + sideInner.offsetHeight + 48;
  if (need > side.offsetHeight) side.style.minHeight = need + 'px';
  sideInner.style.setProperty('--y', Math.round(y) + 'px');
}

/* Pages: the note becomes screens, turned with a pager or ← →. */

type Page = { label: string; nodes: Element[] };

function paginate(note: HTMLElement) {
  const title = $('.note-title', note).textContent!;
  const pages: Page[] = [{ label: 'Overview', nodes: $$('.note-thumb, .note-main', note) }];
  const specs = note.querySelector('.note-specs');
  if (specs) pages.push({ label: 'Details', nodes: [specs] });

  // Each write-up section is a page of its own.
  let section: Page | null = null;
  for (const el of [...(note.querySelector('.more-body')?.children ?? [])]) {
    if (el.tagName === 'H2' || !section) {
      section = { label: el.tagName === 'H2' ? el.textContent! : 'More', nodes: [] };
      pages.push(section);
    }
    section.nodes.push(el);
  }

  const wrap = document.createElement('div');
  wrap.className = 'pages';
  wrap.dataset.title = title;
  const view = document.createElement('div');
  view.className = 'pages-view';
  pages.forEach((p, i) => view.append(page(p.label, i > 0 ? title : null, p.nodes)));
  const pager = document.createElement('nav');
  pager.className = 'pager';
  pager.setAttribute('aria-label', 'Pages');
  pager.innerHTML = '<button type="button" data-turn="-1" aria-label="Previous page">←</button><span class="pager-label" aria-live="polite"></span><button type="button" data-turn="1" aria-label="Next page">→</button>';
  wrap.append(view, pager);
  return wrap;
}

function page(label: string, head: string | null, nodes: Element[]) {
  const pg = document.createElement('section');
  pg.className = 'pg';
  pg.dataset.label = label;
  if (head) {
    const p = document.createElement('p');
    p.className = 'pg-head';
    p.textContent = head;
    pg.append(p);
  }
  if (label === 'Details') {
    const h = document.createElement('h2');
    h.textContent = label;
    pg.append(h);
  }
  pg.append(...nodes);
  return pg;
}

// A page that overflows hands its last blocks to a continuation page.
// Overview drops its thumbnail instead, so the title stays on page one.
function fitPages(wrap: HTMLElement) {
  const view = $('.pages-view', wrap);
  const overflows = () => view.scrollHeight > view.clientHeight + 1;
  for (let i = 0; i < view.children.length; i++) {
    const pg = view.children[i] as HTMLElement;
    turn(wrap, i);
    if (i === 0) {
      if (overflows()) pg.querySelector('.note-thumb')?.remove();
      continue;
    }
    let rest: HTMLElement | null = null;
    while (overflows()) {
      const blocks = [...pg.children].filter(el => !el.matches('.pg-head, h2'));
      if (blocks.length < 2) break;
      if (!rest) {
        rest = page(pg.dataset.label + ', continued', wrap.dataset.title!, []);
        pg.after(rest);
      }
      rest.children[0].after(blocks[blocks.length - 1]);
    }
  }
  turn(wrap, 0);
}

function turn(wrap: HTMLElement, to: number) {
  const pgs = $$('.pg', wrap);
  const i = Math.max(0, Math.min(to, pgs.length - 1));
  pgs.forEach((p, n) => (p.hidden = n !== i));
  wrap.dataset.page = String(i);
  $('.pager-label', wrap).textContent = `${i + 1} / ${pgs.length} · ${pgs[i].dataset.label}`;
  $<HTMLButtonElement>('[data-turn="-1"]', wrap).disabled = i === 0;
  $<HTMLButtonElement>('[data-turn="1"]', wrap).disabled = i === pgs.length - 1;
  $('.pager', wrap).classList.toggle('is-single', pgs.length < 2);
}

let sideFrame = 0;
addEventListener('resize', () => {
  if (study !== 2) return;
  cancelAnimationFrame(sideFrame);
  sideFrame = requestAnimationFrame(() => {
    if (variant === 'anchored') anchor();
    if (variant === 'pages') showSide(current ?? 'about', 'rest');
  });
});

if (study === 2) {
  sideRest();
  document.fonts.ready.then(() => { if (variant === 'anchored') anchor(); });
}

/* ---- 3 inline ---------------------------------------------------------- */

let inline: HTMLElement | null = null;
const inlineStudy: Study = {
  toggles: true,
  open(key, from) {
    inline?.remove();
    const item = from.closest<HTMLElement>('[data-item]')!;

    // The details go after the last item in the clicked item's row.
    const row = $$('[data-item]', item.parentElement!).filter(el => el.offsetTop === item.offsetTop);
    const li = document.createElement('li');
    li.className = 'inline';
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'close';
    close.dataset.close = '';
    close.textContent = 'Close';
    const note = copy(key);
    li.append(close, note);
    row[row.length - 1].after(li);

    const box = item.getBoundingClientRect();
    li.style.setProperty('--notch', `${box.left + box.width / 2 - li.getBoundingClientRect().left - 6}px`);
    inline = li;
    focusTitle(note);
    li.scrollIntoView({ block: 'nearest', behavior: smooth() });
  },
  close() {
    inline?.remove();
    inline = null;
    done();
  },
};

/* ---- 4 caption --------------------------------------------------------- */

const caption = $('[data-caption]');
const captionStudy: Study = {
  toggles: true,
  open(key, from) {
    const note = copy(key);
    $('[data-slot]', caption).replaceChildren(note);
    caption.hidden = false;
    caption.classList.remove('is-tall');
    caption.scrollTop = 0;
    const measure = () => root.style.setProperty('--caption-h', caption.offsetHeight + 'px');
    $('details', note).addEventListener('toggle', event => {
      caption.classList.toggle('is-tall', (event.target as HTMLDetailsElement).open);
      measure();
    });
    measure();
    from.closest('[data-item]')?.scrollIntoView({ block: 'nearest', behavior: smooth() });
    focusTitle(note);
  },
  close() {
    caption.hidden = true;
    root.style.removeProperty('--caption-h');
    done();
  },
};

/* ---- 5 margin ---------------------------------------------------------- */

// Hover or focus previews a note in the margin; a click pins it.
const margin = $('[data-margin]');
const marginSlot = $('[data-slot]', margin);
const leader = document.createElement('div');
leader.className = 'leader';
leader.hidden = true;
document.body.append(leader);

let shown: { key: string; item: HTMLElement } | null = null;
let pinned: { key: string; item: HTMLElement } | null = null;

// The note sits level with its title, and a hairline joins the two.
function place() {
  const note = marginSlot.firstElementChild as HTMLElement | null;
  if (!shown || !note || active() !== 5) { leader.hidden = true; return; }
  const box = margin.getBoundingClientRect();
  const title = $('.item-title, .row-title', shown.item).getBoundingClientRect();
  const top = Math.max(16, Math.min(title.top - box.top, box.height - note.offsetHeight - 16));
  note.style.top = top + 'px';
  const y = title.top + title.height / 2;
  const x1 = shown.item.getBoundingClientRect().right + 12;
  const x2 = box.left - 12;
  leader.hidden = y < 0 || y > innerHeight || x2 <= x1;
  leader.style.cssText = `top:${Math.round(y)}px;left:${Math.round(x1)}px;width:${Math.round(x2 - x1)}px`;
}

function preview(key: string, item: HTMLElement) {
  if (shown?.key === key) return;
  shown = { key, item };
  marginSlot.replaceChildren(copy(key));
  place();
}

function rest() {
  if (pinned) preview(pinned.key, pinned.item);
  else { shown = null; marginSlot.replaceChildren(); place(); }
}

const marginStudy: Study = {
  toggles: true,
  open(key, from) {
    const item = from.closest<HTMLElement>('[data-item]')!;
    pinned = { key, item };
    shown = null;
    preview(key, item);
  },
  close() {
    pinned = null;
    rest();
    done();
  },
};

if (study === 5) {
  document.addEventListener('pointerover', event => {
    if (active() !== 5 || (event as PointerEvent).pointerType === 'touch') return;
    const link = (event.target as Element).closest<HTMLElement>('a[data-open]');
    if (link) preview(link.dataset.open!, link.closest<HTMLElement>('[data-item]')!);
  });
  $('.main').addEventListener('pointerleave', () => { if (active() === 5) rest(); });
  document.addEventListener('focusin', event => {
    const link = (event.target as Element).closest<HTMLElement>('a[data-open]');
    if (link && active() === 5) preview(link.dataset.open!, link.closest<HTMLElement>('[data-item]')!);
  });
  let frame = 0;
  const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(place); };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
}

/* ---- 6 drawer ---------------------------------------------------------- */

// A glass column slides over the right edge. Nothing under it moves.
const drawer = $('[data-drawer]');
const drawerStudy: Study = {
  toggles: true,
  open(key) {
    const note = copy(key);
    $('[data-slot]', drawer).replaceChildren(note);
    drawer.classList.add('is-open');
    drawer.scrollTop = 0;
    focusTitle(note);
  },
  close() {
    drawer.classList.remove('is-open');
    done();
  },
};

/* ---- wiring ------------------------------------------------------------ */

const studies: Record<number, Study> = { 1: cardStudy, 2: sideStudy, 3: inlineStudy, 4: captionStudy, 5: marginStudy, 6: drawerStudy };
const studyFor = (key: string) => (key === 'about' && (active() === 3 || active() === 5) ? cardStudy : studies[active()]);

document.addEventListener('click', event => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const target = event.target as Element;

  const turner = target.closest<HTMLElement>('[data-turn]');
  if (turner) {
    const wrap = turner.closest<HTMLElement>('.pages')!;
    turn(wrap, Number(wrap.dataset.page) + Number(turner.dataset.turn));
    return;
  }

  const link = target.closest<HTMLAnchorElement>('a[data-open]');
  if (link) {
    event.preventDefault();
    const key = link.dataset.open!;
    const s = studyFor(key);
    if (s.toggles && current === key) { s.close(); return; }
    if (openStudy && openStudy !== s) openStudy.close();
    trigger = link;
    current = key;
    openStudy = s;
    mark(key);
    s.open(key, link);
    return;
  }

  if (target.closest('[data-close]')) { openStudy?.close(); return; }

  // A click on empty page closes the drawer.
  if (openStudy === drawerStudy && !target.closest('[data-drawer], a, button, .mast, .lab-bar')) drawerStudy.close();
});

document.addEventListener('keydown', event => {
  const pages = side.querySelector<HTMLElement>('.pages');
  if (pages && side.contains(document.activeElement) && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
    event.preventDefault();
    turn(pages, Number(pages.dataset.page) + (event.key === 'ArrowRight' ? 1 : -1));
    return;
  }
  if (event.key === 'Escape' && openStudy && openStudy !== cardStudy) {
    event.preventDefault();
    openStudy.close();
  }
});
