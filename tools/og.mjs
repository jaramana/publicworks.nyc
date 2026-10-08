/* Draw the share image, the site's public/og.png, from its name, intro and works.

   Run it after adding, removing, renaming or reordering a work:

     npm run og

   It writes a 1200×630 card as HTML and screenshots it with headless Chrome.
   SITE picks the site, as for the build. CHROME overrides the browser's
   path. Names that don't fit on two lines end in "and N more". */

import { readFileSync, readdirSync, writeFileSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { site } from '../src/current-site.js';

const root = new URL('..', import.meta.url).pathname;
const siteDir = join(root, 'sites', site);
const { siteName, defaultLang } = await import(new URL(`../sites/${site}/site.js`, import.meta.url).href);
const { copy } = await import(new URL(`../sites/${site}/copy.js`, import.meta.url).href);
const chrome = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const out = join(siteDir, 'public/og.png');

// Works in page order, read from the records' frontmatter.
const dir = join(siteDir, 'projects');
const field = (text, name) => text.match(new RegExp(`^${name}:\\s*"?(.*?)"?\\s*$`, 'm'))?.[1];
const works = readdirSync(dir).filter(f => f.endsWith('.md')).sort()
  .map(f => readFileSync(join(dir, f), 'utf8').split(/^---$/m)[1])
  .filter(fm => field(fm, 'status') === 'works' && field(fm, 'draft') !== 'true')
  .map(fm => ({ title: field(fm, 'title'), order: Number(field(fm, 'order') ?? 99) }))
  .sort((a, b) => a.order - b.order)
  .map(w => w.title);

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const font = file => 'data:font/woff2;base64,' + readFileSync(join(root, 'src/fonts', file)).toString('base64');

const html = `<!doctype html>
<meta charset="utf-8">
<style>
@font-face { font-family: "PW Heros"; src: url(${font('pw-heros-regular.woff2')}); font-weight: 400; }
@font-face { font-family: "PW Heros"; src: url(${font('pw-heros-bold.woff2')}); font-weight: 700; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 1200px; height: 630px; overflow: hidden; }
body { display: flex; flex-direction: column; padding: 92px 96px 72px; background: #fff; color: #161616;
  font-family: "PW Heros", Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
.mark { font-size: 76px; font-weight: 700; line-height: 1; letter-spacing: -.02em; }
.intro { max-width: 17em; margin-top: 40px; font-size: 44px; line-height: 1.22; letter-spacing: -.01em; text-wrap: balance; }
.names { margin-top: auto; padding-top: 24px; border-top: 1px solid rgba(0, 0, 0, .12);
  font-size: 17px; line-height: 1.6; letter-spacing: .08em; text-transform: uppercase; color: #6c6c70; }
</style>
<p class="mark">${esc(siteName)}</p>
<p class="intro">${esc(copy[defaultLang].intro)}</p>
<p class="names" data-names="${esc(JSON.stringify(works))}"></p>
<script>
  document.fonts.ready.then(() => {
    const el = document.querySelector('.names');
    const names = JSON.parse(el.dataset.names).map(name => name.replace(/ /g, '\\u00a0'));
    const most = parseFloat(getComputedStyle(el).lineHeight) * 2 + parseFloat(getComputedStyle(el).paddingTop) + 2;
    for (let n = names.length; n > 0; n--) {
      el.textContent = names.slice(0, n).join(' · ') + (n < names.length ? ' · and ' + (names.length - n) + ' more' : '');
      if (el.offsetHeight <= most) break;
    }
  });
</script>`;

const page = join(mkdtempSync(join(tmpdir(), 'og-')), 'og.html');
writeFileSync(page, html);
execFileSync(chrome, [
  '--headless', '--hide-scrollbars', '--force-device-scale-factor=1',
  '--window-size=1200,630', '--virtual-time-budget=3000',
  '--screenshot=' + out, 'file://' + page,
], { stdio: 'ignore' });
console.log(`sites/${site}/public/og.png: ${siteName}, ${works.length} works`);
