// Browser checks for one page: axe, reflow, keyboard, target size, text
// spacing, media, no-JS, requests, links, metadata and the suite contract.

import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];
const WIDTHS = [320, 360, 375, 414, 600, 768, 1024, 1280, 1440, 1920, 2560];
const MAX_STOPS = 250;
const wait = ms => new Promise(r => setTimeout(r, ms));

const ABOUT = ['Why', 'Scope', 'Built', 'Independence', 'Credits', 'Reuse', 'Contact'];
const DATA = ['Downloads', 'Sources', 'Process', 'Limits'];
const FOOTER_LINE = 'A publicworks.nyc project.';
const NOTICE = 'This is not an official product.';

async function open(browser, url, { width = 1440, height = 900, js = true, scheme } = {}) {
  const page = await browser.newPage();
  await page.setJavaScriptEnabled(js);
  await page.setViewport({ width, height });
  if (scheme) await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: scheme }]);
  const log = { hosts: new Set(), errors: [], failed: [] };
  page.on('request', r => { try { log.hosts.add(new URL(r.url()).host); } catch {} });
  page.on('console', m => { if (m.type() === 'error') log.errors.push(m.text().slice(0, 200)); });
  page.on('pageerror', e => log.errors.push(String(e.message || e).slice(0, 200)));
  page.on('requestfailed', r => log.failed.push(`${r.failure()?.errorText} ${r.url().slice(0, 120)}`));
  page.on('response', r => { if (r.status() >= 400 && r.url() !== url) log.failed.push(`${r.status()} ${r.url().slice(0, 120)}`); });
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
  } catch (e) {
    log.errors.push('load: ' + e.message.slice(0, 120));
  }
  await wait(600);
  page.log = log;
  return page;
}

async function axe(page) {
  await page.evaluate(AXE);
  const res = await page.evaluate(tags => axe.run(document, { runOnly: { type: 'tag', values: tags } }), AXE_TAGS);
  return {
    violations: res.violations.map(v => ({
      id: v.id, impact: v.impact, count: v.nodes.length, help: v.help,
      sample: v.nodes.slice(0, 4).map(n => n.target.join(' ')),
    })),
    incomplete: res.incomplete.map(v => ({ id: v.id, count: v.nodes.length })),
    passes: res.passes.length,
  };
}

// Widths at which the page scrolls sideways, with the elements that stick out.
async function reflow(page) {
  const out = {};
  for (const w of WIDTHS) {
    await page.setViewport({ width: w, height: 900 });
    await wait(250);
    const r = await page.evaluate(() => {
      const de = document.documentElement;
      if (de.scrollWidth <= de.clientWidth + 1) return null;
      const clipped = el => {
        for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
          const o = getComputedStyle(p).overflowX;
          if (o !== 'visible') return true;
        }
        return false;
      };
      const wide = [...document.body.querySelectorAll('*')]
        .filter(el => el.getBoundingClientRect().right > de.clientWidth + 1 && !clipped(el))
        .filter(el => !el.parentElement || el.parentElement.getBoundingClientRect().right <= de.clientWidth + 1)
        .slice(0, 3)
        .map(el => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : '') + ` ${Math.round(el.getBoundingClientRect().right)}px`);
      return { scrollWidth: de.scrollWidth, wide };
    });
    if (r) out[w] = r;
  }
  return out;
}

// Waits until a smooth scroll to the focused element has stopped.
async function settle(page) {
  let last = '';
  for (let i = 0; i < 25; i++) {
    await wait(40);
    const now = await page.evaluate(() => {
      const r = document.activeElement?.getBoundingClientRect();
      return `${scrollX},${scrollY},${r ? Math.round(r.top) + ',' + Math.round(r.left) : ''}`;
    });
    if (now === last) return;
    last = now;
  }
}

// Every tab stop: whether a focus indicator shows, whether a fixed or sticky
// layer covers it, and whether it lands off screen.
async function keyboard(page) {
  await page.evaluate(() => { document.activeElement?.blur(); scrollTo(0, 0); });
  const stops = [];
  let capped = false;
  for (let i = 0; i < MAX_STOPS + 1; i++) {
    await page.keyboard.press('Tab');
    await settle(page);
    const s = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body || el === document.documentElement) return null;
      const name = (el.getAttribute('aria-label') || el.textContent || el.value || el.getAttribute('title') || el.tagName)
        .trim().replace(/\s+/g, ' ').slice(0, 40);
      const id = el.tagName.toLowerCase() + ' "' + name + '"';
      if (el.tagName === 'IFRAME') return { id, frame: true };
      const shows = node => {
        const cs = getComputedStyle(node);
        return (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== 'none';
      };
      let ring = false;
      for (let n = el, d = 0; n && d < 4 && !ring; n = n.parentElement, d++) ring = shows(n);
      if (!ring) {
        const props = ['backgroundColor', 'color', 'borderTopColor', 'borderBottomColor', 'textDecorationLine', 'textDecorationColor'];
        const on = props.map(p => getComputedStyle(el)[p]);
        el.blur();
        const off = props.map(p => getComputedStyle(el)[p]);
        el.focus();
        ring = on.some((v, k) => v !== off[k]);
      }
      const r = el.getBoundingClientRect();
      let covered = false;
      if (r.width && r.height) {
        const cx = Math.min(Math.max(r.left + r.width / 2, 0), innerWidth - 1);
        const cy = Math.min(Math.max(r.top + Math.min(r.height / 2, 10), 0), innerHeight - 1);
        const hit = document.elementFromPoint(cx, cy);
        if (hit && hit !== el && !el.contains(hit) && !hit.contains(el)) {
          for (let n = hit; n; n = n.parentElement) {
            const p = getComputedStyle(n).position;
            if ((p === 'fixed' || p === 'sticky') && !n.contains(el)) { covered = true; break; }
          }
        }
      }
      return {
        id, ring, covered,
        hidden: !r.width || !r.height,
        offscreen: r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth,
      };
    });
    if (!s) break;
    if (s.frame) { stops.push(s); break; }
    if (stops.length > 1 && stops[0].id === s.id) break;
    if (stops.length >= MAX_STOPS) { capped = true; break; }
    stops.push(s);
  }
  const ids = list => [...new Set(list.map(s => s.id))].slice(0, 12);
  return {
    stops: stops.length, capped,
    noRing: ids(stops.filter(s => !s.frame && !s.ring && !s.hidden)),
    covered: ids(stops.filter(s => s.covered)),
    offscreen: ids(stops.filter(s => s.offscreen && !s.hidden)),
    hidden: ids(stops.filter(s => s.hidden)),
  };
}

// WCAG 2.5.8: targets under 24px that fail both the inline and the spacing
// exceptions.
async function targets(page) {
  return page.evaluate(() => {
    const sel = 'a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button], [role=tab], [role=link], [tabindex]:not([tabindex="-1"])';
    // A target scrolled out of a clipping box is not on screen.
    const clippedOut = (el, r) => {
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        const cs = getComputedStyle(p);
        if (cs.overflowX === 'visible' && cs.overflowY === 'visible') continue;
        const b = p.getBoundingClientRect();
        if (r.bottom <= b.top || r.top >= b.bottom || r.right <= b.left || r.left >= b.right) return true;
      }
      return false;
    };
    const all = [...document.querySelectorAll(sel)].map(el => ({ el, r: el.getBoundingClientRect() }))
      .filter(t => t.r.width && t.r.height && t.el.checkVisibility({ visibilityProperty: true }) && !clippedOut(t.el, t.r));
    // A link counts as inline when its block holds running text besides
    // links: a sentence, not a row of links.
    const inline = el => {
      if (getComputedStyle(el).display !== 'inline') return false;
      let block = el.parentElement;
      while (block && getComputedStyle(block).display.startsWith('inline')) block = block.parentElement;
      if (!block) return false;
      const links = [...block.querySelectorAll('a, button')].reduce((n, a) => n + a.textContent.trim().length, 0);
      return block.textContent.replace(/\s+/g, ' ').trim().length - links > 12;
    };
    const small = all.filter(t => (t.r.width < 24 || t.r.height < 24) && !inline(t.el)
      && !(t.el.tagName === 'INPUT' && ['checkbox', 'radio'].includes(t.el.type) && t.el.closest('label')));
    const dist = (x, y, r) => Math.hypot(Math.max(r.left - x, 0, x - r.right), Math.max(r.top - y, 0, y - r.bottom));
    const fails = small.filter(t => {
      const cx = t.r.left + t.r.width / 2, cy = t.r.top + t.r.height / 2;
      return all.some(o => {
        if (o.el === t.el || o.el.contains(t.el) || t.el.contains(o.el)) return false;
        const oSmall = o.r.width < 24 || o.r.height < 24;
        if (oSmall) return Math.hypot(cx - (o.r.left + o.r.width / 2), cy - (o.r.top + o.r.height / 2)) < 24;
        return dist(cx, cy, o.r) < 12;
      });
    });
    return [...new Set(fails.map(t => `${t.el.tagName.toLowerCase()} "${(t.el.getAttribute('aria-label') || t.el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 28)}" ${Math.round(t.r.width)}x${Math.round(t.r.height)}`))].slice(0, 15);
  });
}

// WCAG 1.4.12: apply the test spacing, then look for clipped text and
// sideways scroll.
async function spacing(page) {
  await page.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-bottom: 2em !important; }' });
  await wait(500);
  return page.evaluate(() => {
    const clipped = [...document.body.querySelectorAll('*')].filter(el => {
      const cs = getComputedStyle(el);
      if (!/(hidden|clip)/.test(cs.overflow + cs.overflowX + cs.overflowY)) return false;
      if (el.clientWidth < 3 || el.clientHeight < 3 || !el.textContent.trim()) return false;
      if (el.closest('svg, canvas, .maplibregl-map, .leaflet-container')) return false;
      return el.scrollHeight > el.clientHeight + 2 || el.scrollWidth > el.clientWidth + 2;
    }).slice(0, 8).map(el => el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : '') + ` "${el.textContent.trim().slice(0, 30)}"`);
    return { hScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1, clipped };
  });
}

async function media(page) {
  const cdp = await page.createCDPSession();
  await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await wait(400);
  const motion = await page.evaluate(() => ({
    running: document.getAnimations().filter(a => a.playState === 'running' && (a.effect?.getTiming().iterations === Infinity || a.effect?.getTiming().duration > 200)).length,
    scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
  }));
  await cdp.send('Emulation.setEmulatedMedia', { features: [] });
  await page.emulateMediaType('print');
  await wait(200);
  const print = await page.evaluate(() => ({
    pinned: [...document.querySelectorAll('body *')].filter(el => ['fixed', 'sticky'].includes(getComputedStyle(el).position) && el.offsetHeight > 0).length,
    text: document.body.innerText.length,
  }));
  await page.emulateMediaType(null);
  return { motion, print };
}

async function nojs(browser, url) {
  const page = await open(browser, url, { width: 375, height: 812, js: false });
  const r = await page.evaluate(() => {
    const text = (document.querySelector('main') || document.body).innerText.trim();
    return {
      text: text.length,
      loadingOnly: /^(Loading|Loading…|Loading\.\.\.)$/m.test(text) && text.length < 400,
      h1: !!document.querySelector('h1'),
      noscript: !!document.querySelector('noscript'),
      hScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    };
  });
  await page.close();
  return r;
}

async function facts(page) {
  return page.evaluate(() => {
    const meta = n => document.querySelector(`meta[name="${n}"], meta[property="${n}"]`)?.content || null;
    const heads = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].filter(h => h.offsetParent || h.getClientRects().length);
    const skips = [];
    heads.forEach((h, i) => {
      const prev = i ? +heads[i - 1].tagName[1] : 0;
      if (+h.tagName[1] > prev + 1) skips.push(`${heads[i - 1]?.tagName || 'start'}→${h.tagName} "${h.textContent.trim().slice(0, 30)}"`);
    });
    const links = [...document.querySelectorAll('a[href]')].map(a => a.href);
    const frags = [...document.querySelectorAll('a[href^="#"]')].map(a => a.getAttribute('href').slice(1))
      .filter(f => f && !document.getElementById(decodeURIComponent(f)) && !document.getElementsByName(f).length);
    return {
      title: document.title, lang: document.documentElement.lang,
      description: meta('description'), canonical: document.querySelector('link[rel=canonical]')?.href || null,
      ogTitle: meta('og:title'), ogDescription: meta('og:description'), ogUrl: meta('og:url'),
      ogImage: meta('og:image'), themeColor: meta('theme-color'),
      icon: !!document.querySelector('link[rel~=icon]'), touchIcon: !!document.querySelector('link[rel=apple-touch-icon]'),
      viewport: meta('viewport'),
      h1: [...document.querySelectorAll('h1')].filter(h => h.getClientRects().length).length, skips,
      h2: [...document.querySelectorAll(document.querySelector('main') ? 'main h2' : 'h2')].filter(h => h.getClientRects().length).map(h => {
        const c = h.cloneNode(true);
        c.querySelectorAll('.count').forEach(n => n.remove());
        return c.textContent.trim();
      }),
      links: [...new Set(links)], brokenFragments: [...new Set(frags)],
      footerLine: document.body.innerText.includes('A publicworks.nyc project.'),
      notice: document.body.innerText.includes('This is not an official product.'),
      dateLine: (document.body.innerText.match(/(Data built|Snapshot taken|current as of|checked)\s+(\d{1,2} [A-Z][a-z]+ \d{4}|[A-Z][a-z]{2} \d{1,2}, \d{4})/i) || [null])[0],
      darkCss: [...document.styleSheets].some(s => { try { return [...s.cssRules].some(r => r.conditionText?.includes('prefers-color-scheme: dark')); } catch { return false; } }),
      storage: { cookies: document.cookie.length, local: localStorage.length, session: sessionStorage.length },
    };
  });
}

// Headings the suite contract requires, in order. Extras may sit between.
function inOrder(found, wanted) {
  let i = 0;
  for (const h of found) if (h === wanted[i]) i++;
  return wanted.slice(i);
}

function contract(kind, f, site) {
  const issues = [];
  if (!site.portfolio && !f.footerLine) issues.push(`page lacks "${FOOTER_LINE}"`);
  if (!site.portfolio && kind === 'home' && !f.notice) issues.push(`home lacks "${NOTICE}"`);
  if (kind === 'about') {
    const missing = inOrder(f.h2, ABOUT);
    if (missing.length) issues.push(`About headings out of order or missing from: ${missing.join(', ')} (found ${f.h2.join(', ')})`);
  }
  if (kind === 'data') {
    const order = site.id.startsWith('wealth') ? ['Process', 'Downloads', 'Sources', 'Limits'] : DATA;
    const missing = inOrder(f.h2, order);
    if (missing.length) issues.push(`Data headings out of order or missing from: ${missing.join(', ')} (found ${f.h2.join(', ')})`);
    const bad = f.h2.filter(h => /\s/.test(h));
    if (bad.length) issues.push(`Data headings with more than one word: ${bad.join(', ')}`);
    if (!f.dateLine) issues.push('Data page shows no build or check date');
  }
  return issues;
}

export async function checkPage(browser, site, base, [path, kind]) {
  const url = base + path;
  const r = { url: path, kind };
  const page = await open(browser, url);
  const f = await facts(page);
  r.facts = { ...f, links: f.links.length };
  r.contract = contract(kind, f, site);
  r.axe = { 1440: await axe(page) };
  r.media = await media(page);
  r.spacing = null;
  r.hosts = [...page.log.hosts];
  r.errors = [...new Set(page.log.errors)].filter(e => !(kind === '404' && /status of 404/.test(e)));
  r.failed = [...new Set(page.log.failed)];
  r.reflow = await reflow(page);
  await page.setViewport({ width: 1440, height: 900 });
  await page.reload({ waitUntil: 'networkidle2', timeout: 45000 }).catch(() => {});
  await wait(400);
  r.targets = { 1440: await targets(page) };
  r.keyboard = { 1440: await keyboard(page) };
  r.spacing = await spacing(page);
  await page.close();

  const phone = await open(browser, url, { width: 375, height: 812 });
  r.axe[375] = await axe(phone);
  r.targets[375] = await targets(phone);
  r.keyboard[375] = await keyboard(phone);
  await phone.close();

  if (f.darkCss) {
    const dark = await open(browser, url, { scheme: 'dark' });
    r.axe.dark = await axe(dark);
    await dark.close();
  }
  r.nojs = await nojs(browser, url);
  r.linkList = f.links;
  return r;
}
