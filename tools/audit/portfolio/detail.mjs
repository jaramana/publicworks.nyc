// Details for axe's undecided results and target sizes inside an open note.
import { createRequire } from 'node:module';
import fs from 'node:fs';
const [tools, url] = process.argv.slice(2);
const require = createRequire(tools + '/package.json');
const puppeteer = require('puppeteer-core');
const axeSource = fs.readFileSync(tools + '/node_modules/axe-core/axe.min.js', 'utf8');
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
for (const [w, h] of [[375, 812], [1440, 900]]) {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h });
  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.querySelector('#works a[data-open]').click());
  await new Promise(r => setTimeout(r, 400));
  await page.evaluate(axeSource);
  const res = await page.evaluate(() => axe.run(document, { runOnly: ['color-contrast', 'label-content-name-mismatch'] }));
  console.log(`\n== ${w}`);
  for (const v of res.incomplete) for (const n of v.nodes) console.log(v.id, '|', n.target.join(' '), '|', (n.any[0]?.message || '').slice(0, 140), '|', n.html.slice(0, 120));
  const targets = await page.evaluate(() => [...document.querySelectorAll('[data-note].is-shown a, [data-note].is-shown button, .drop a, .pager button')].filter(e => e.offsetWidth).map(e => { const r = e.getBoundingClientRect(); return `${e.textContent.trim().slice(0, 14) || e.getAttribute('aria-label')} ${Math.round(r.width)}x${Math.round(r.height)} @${Math.round(r.left)},${Math.round(r.top)}`; }));
  console.log('targets in note:', targets.join(' ; '));
  await page.close();
}
await browser.close();
