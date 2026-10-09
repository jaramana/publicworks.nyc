// Checks for the touch, short-window and image-size fixes.
import { createRequire } from 'node:module';
const [tools, url] = process.argv.slice(2);
const require = createRequire(tools + '/package.json');
const puppeteer = require('puppeteer-core');
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const place = () => [...document.querySelectorAll('.nav a, .wordmark, #works .tile')].slice(0, 7).map(e => { const r = e.getBoundingClientRect(); return `${Math.round(r.left)},${Math.round(r.top)}`; }).join(' ');

// Image choice: the picked file is at least as wide as the tile on screen.
for (const [w, dpr] of [[375, 3], [641, 2], [1000, 2], [1140, 2], [1440, 2], [1920, 1]]) {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: 900, deviceScaleFactor: dpr });
  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.evaluate(async () => { for (const img of document.querySelectorAll('#works img')) { img.loading = 'eager'; await img.decode().catch(() => {}); } });
  console.log(`${w}@${dpr}x`, await page.evaluate(dpr => {
    const img = document.querySelector('#works .tile img');
    const shown = Math.round(img.getBoundingClientRect().width);
    const path = new URL(img.currentSrc).pathname;
    const entries = [...img.parentElement.querySelectorAll('source, img')].flatMap(e => (e.srcset || '').split(',').map(x => x.trim().split(/\s+/)));
    const file = +(entries.find(([u]) => u === path)?.[1] || '0').replace('w', '');
    const largest = Math.max(...entries.map(([, w]) => +(w || '0').replace('w', '')));
    return `tile ${shown}px x${dpr} needs ${shown * dpr} | file ${file}w of max ${largest}w ${file >= Math.min(shown * dpr, largest) ? 'ok' : 'SOFT'}`;
  }, dpr));
  await page.close();
}
await browser.close();
