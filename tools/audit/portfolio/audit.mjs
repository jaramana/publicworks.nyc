// Headless audit of the built portfolio: axe, keyboard, targets, media
// emulation, no-JS and third-party requests. Usage: node audit.mjs <tools> <out> <url>
import { createRequire } from 'node:module';
import fs from 'node:fs';

const [tools, out, url] = process.argv.slice(2);
const require = createRequire(tools + '/package.json');
const puppeteer = require('puppeteer-core');
const axeSource = fs.readFileSync(tools + '/node_modules/axe-core/axe.min.js', 'utf8');
const report = {};

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
});

async function fresh(width, height, { js = true } = {}) {
  const page = await browser.newPage();
  await page.setJavaScriptEnabled(js);
  await page.setViewport({ width, height });
  const hosts = new Set();
  page.on('request', r => hosts.add(new URL(r.url()).host));
  await page.goto(url, { waitUntil: 'networkidle0' });
  page.hosts = hosts;
  return page;
}

async function axe(page, label) {
  await page.evaluate(axeSource);
  const res = await page.evaluate(() => axe.run(document, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] },
  }));
  report['axe ' + label] = {
    violations: res.violations.map(v => ({ id: v.id, impact: v.impact, count: v.nodes.length, help: v.help, sample: v.nodes.slice(0, 3).map(n => n.target.join(' ')) })),
    incomplete: res.incomplete.map(v => ({ id: v.id, count: v.nodes.length, help: v.help })),
    passes: res.passes.length,
  };
}

// 1. axe at phone and desktop, at rest and with a note open.
for (const [w, h] of [[375, 812], [1440, 900]]) {
  const page = await fresh(w, h);
  await axe(page, `${w} rest`);
  await page.evaluate(() => document.querySelector('#works a[data-open]').click());
  await new Promise(r => setTimeout(r, 400));
  await axe(page, `${w} note open`);
  await page.close();
}

// 2. Dark mode contrast.
{
  const page = await fresh(1440, 900);
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
  await new Promise(r => setTimeout(r, 300));
  await axe(page, '1440 dark');
  await page.close();
}

// 3. Keyboard: every tab stop, whether it shows a focus ring and whether the
//    sticky masthead covers it.
for (const [w, h] of [[375, 812], [1440, 900]]) {
  const page = await fresh(w, h);
  const stops = [];
  for (let i = 0; i < 80; i++) {
    await page.keyboard.press('Tab');
    await new Promise(r => setTimeout(r, 60));
    const s = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const r = el.getBoundingClientRect();
      const mast = document.querySelector('[data-mast]').getBoundingClientRect();
      const inMast = el.closest('[data-mast]');
      const cs = getComputedStyle(el);
      const tile = el.closest('.tile');
      const ring = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0
        || (tile && getComputedStyle(tile).outlineStyle !== 'none' && parseFloat(getComputedStyle(tile).outlineWidth) > 0)
        || el.matches('.find input');
      return {
        name: (el.getAttribute('aria-label') || el.textContent || el.value || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 40),
        tag: el.tagName,
        ring,
        covered: !inMast && r.top < mast.bottom - 1 && r.bottom > mast.top,
        offscreen: r.bottom < 0 || r.top > innerHeight,
      };
    });
    if (!s) break;
    if (stops.length && stops[0].name === s.name && stops[0].tag === s.tag) break;
    stops.push(s);
  }
  report[`keyboard ${w}`] = {
    stops: stops.length,
    first: stops.slice(0, 6).map(s => s.name),
    noRing: stops.filter(s => !s.ring).map(s => s.name),
    covered: stops.filter(s => s.covered).map(s => s.name),
    offscreen: stops.filter(s => s.offscreen).map(s => s.name),
  };
  await page.close();
}

// 4. Target size (WCAG 2.5.8): interactive targets under 24px in either
//    direction, skipping links inside running text.
for (const [w, h] of [[375, 812], [1440, 900]]) {
  const page = await fresh(w, h);
  report[`targets ${w}`] = await page.evaluate(() => {
    const small = [];
    for (const el of document.querySelectorAll('a[href], button, input, [tabindex]:not([tabindex="-1"])')) {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      if (el.closest('p, .pg-prose, .notice, .colophon') && el.tagName === 'A') continue;
      const box = el.classList.contains('tile-link') ? el.closest('.tile').getBoundingClientRect() : r;
      if (box.width < 24 || box.height < 24) small.push(`${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 24)}" ${Math.round(box.width)}x${Math.round(box.height)}`);
    }
    return [...new Set(small)];
  });
  await page.close();
}

// 5. Text spacing (WCAG 1.4.12): apply the test spacing, then check the
//    panel's shown page still fits and nothing scrolls sideways.
{
  const page = await fresh(1440, 900);
  await page.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-bottom: 2em !important; }' });
  await new Promise(r => setTimeout(r, 600));
  report['text spacing 1440'] = await page.evaluate(() => {
    const inner = document.querySelector('.side-inner');
    return { panelClipped: inner.scrollHeight > inner.clientHeight + 1, hScroll: document.documentElement.scrollWidth > innerWidth };
  });
  await page.setViewport({ width: 1440, height: 899 });
  await new Promise(r => setTimeout(r, 600));
  report['text spacing 1440 after resize'] = await page.evaluate(() => {
    const inner = document.querySelector('.side-inner');
    return { panelClipped: inner.scrollHeight > inner.clientHeight + 1 };
  });
  await page.close();
}

// 6. Forced colors, reduced motion, reduced transparency, print.
{
  const page = await fresh(1440, 900);
  const cdp = await page.createCDPSession();
  const media = features => cdp.send('Emulation.setEmulatedMedia', { features });
  await media([{ name: 'forced-colors', value: 'active' }]);
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: out + '/forced-colors.png' });
  await media([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  report['reduced motion'] = await page.evaluate(() => {
    const t = getComputedStyle(document.querySelector('.tile-media'));
    return { tileTransition: t.transitionDuration, scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior };
  });
  await media([{ name: 'prefers-reduced-transparency', value: 'reduce' }]);
  report['reduced transparency'] = await page.evaluate(() => getComputedStyle(document.querySelector('[data-mast]')).backdropFilter);
  await media([]);
  await page.emulateMediaType('print');
  await page.pdf({ path: out + '/print.pdf', format: 'Letter' });
  report['print'] = await page.evaluate(() => ({
    mastPosition: getComputedStyle(document.querySelector('[data-mast]')).position,
    notesShown: [...document.querySelectorAll('[data-note]')].filter(n => n.offsetHeight > 0).length,
  }));
  await page.close();
}

// 7. No JavaScript: every note readable, every #record- link resolves.
{
  const page = await fresh(1440, 900, { js: false });
  report['no js'] = await page.evaluate(() => {
    const notes = [...document.querySelectorAll('[data-note]')];
    const links = [...document.querySelectorAll('a[href^="#record-"]')];
    return {
      notes: notes.length,
      visible: notes.filter(n => n.offsetHeight > 0).length,
      brokenAnchors: links.filter(a => !document.getElementById(a.getAttribute('href').slice(1))).map(a => a.getAttribute('href')),
      hScroll: document.documentElement.scrollWidth > innerWidth,
    };
  });
  await page.close();
}

// 8. Requests to other hosts.
{
  const page = await fresh(1440, 900);
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
  await new Promise(r => setTimeout(r, 800));
  report['hosts'] = [...page.hosts];
  report['storage'] = await page.evaluate(() => ({ cookies: document.cookie, local: localStorage.length, session: sessionStorage.length }));
  await page.close();
}

// 9. Headings and landmarks.
{
  const page = await fresh(1440, 900);
  report['outline'] = await page.evaluate(() => ({
    headings: [...document.querySelectorAll('h1,h2,h3,h4')].filter(h => h.offsetParent || h.closest('[data-note]')).slice(0, 14).map(h => h.tagName + ' ' + h.textContent.trim().slice(0, 40)),
    h1: document.querySelectorAll('h1').length,
    landmarks: [...document.querySelectorAll('header, nav, main, aside, footer, [role]')].filter(e => ['header', 'nav', 'main', 'aside', 'footer'].includes(e.tagName.toLowerCase()) || ['banner', 'navigation', 'main', 'complementary', 'contentinfo', 'search', 'region'].includes(e.getAttribute('role'))).map(e => e.tagName.toLowerCase() + (e.getAttribute('aria-label') ? `[${e.getAttribute('aria-label')}]` : '') + (e.getAttribute('role') ? `(${e.getAttribute('role')})` : '')),
    lang: document.documentElement.lang,
    title: document.title,
  }));
  await page.close();
}

await browser.close();
fs.writeFileSync(out + '/audit.json', JSON.stringify(report, null, 1));
console.log(JSON.stringify(report, null, 1));
