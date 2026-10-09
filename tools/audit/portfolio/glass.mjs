// Worst contrast of the masthead's text while each tile scrolls under the glass.
import { createRequire } from 'node:module';
const [tools, url] = process.argv.slice(2);
const require = createRequire(tools + '/package.json');
const puppeteer = require('puppeteer-core');
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const lum = ([r, g, b]) => [r, g, b].map(v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }).reduce((a, v, i) => a + v * [.2126, .7152, .0722][i], 0);
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + .05) / (y + .05); };
for (const scheme of ['light', 'dark']) for (const [w, h] of [[375, 812], [1440, 900]]) {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h });
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: scheme }]);
  await page.goto(url, { waitUntil: 'networkidle0' });
  const colors = await page.evaluate(() => ({
    nav: getComputedStyle(document.querySelector('.nav a')).color.match(/\d+/g).slice(0, 3).map(Number),
    ink: getComputedStyle(document.querySelector('.wordmark')).color.match(/\d+/g).slice(0, 3).map(Number),
  }));
  let worst = { nav: 99, ink: 99, at: null };
  const tops = await page.evaluate(() => [...document.querySelectorAll('#works .tile-media')].map(m => m.getBoundingClientRect().top + scrollY));
  for (const top of tops) for (const off of [0, 60, 120, 180]) {
    await page.evaluate(y => scrollTo(0, y), top - 20 + off);
    await new Promise(r => setTimeout(r, 120));
    const box = await page.evaluate(() => { const r = document.querySelector('.nav').getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top - 4), width: Math.round(r.width), height: Math.round(r.height + 8), sy: scrollY }; });
    const b64 = await page.screenshot({ encoding: 'base64' });
    // Background = the pixels farthest from the text color, sampled per column.
    const bgs = await page.evaluate(async (src, text, box) => {
      const img = new Image(); img.src = 'data:image/png;base64,' + src; await img.decode();
      const c = document.createElement('canvas'); c.width = box.width; c.height = box.height;
      const x = c.getContext('2d'); x.drawImage(img, box.x, box.y, box.width, box.height, 0, 0, box.width, box.height);
      const d = x.getImageData(0, 0, c.width, c.height).data;
      const out = [];
      for (let i = 0; i < c.width; i += 4) {
        let best = null, far = -1;
        for (let j = 0; j < c.height; j++) {
          const k = (j * c.width + i) * 4, p = [d[k], d[k + 1], d[k + 2]];
          const dist = Math.abs(p[0] - text[0]) + Math.abs(p[1] - text[1]) + Math.abs(p[2] - text[2]);
          if (dist > far) { far = dist; best = p; }
        }
        out.push(best);
      }
      return out;
    }, b64, colors.nav, box);
    for (const bg of bgs) {
      const n = ratio(colors.nav, bg), k = ratio(colors.ink, bg);
      if (n < worst.nav) worst = { ...worst, nav: n, bg, at: box.sy };
      if (k < worst.ink) worst.ink = k;
    }
  }
  console.log(`${scheme} ${w} (scrollY ${worst.at}): nav ${colors.nav} worst ${worst.nav.toFixed(2)}:1 on ${worst.bg} | ink worst ${worst.ink.toFixed(2)}:1`);
  await page.close();
}
await browser.close();
