// Layout shift on each page under slow network and CPU, with the elements
// that moved. Lighthouse gives the score; this names the cause.
//
// Usage: node cls.mjs [site ...]

import puppeteer from 'puppeteer-core';
import { SITES } from './sites.mjs';
import { serve } from './serve.mjs';

const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const wanted = process.argv.slice(2);
const sites = SITES.filter(s => !wanted.length || wanted.includes(s.id));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });

for (const s of sites) {
  const server = await serve(s.root, s.port + 300);
  for (const [p, kind] of s.pages) {
    if (kind === '404') continue;
    for (const w of [412, 1350]) {
      const page = await browser.newPage();
      await page.setViewport({ width: w, height: 900 });
      const cdp = await page.createCDPSession();
      await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 });
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
      await page.evaluateOnNewDocument(() => {
        window.__shifts = [];
        new PerformanceObserver(list => {
          for (const e of list.getEntries()) {
            if (e.hadRecentInput) continue;
            window.__shifts.push({
              v: e.value,
              src: (e.sources || []).map(x => {
                const n = x.node;
                const name = n?.nodeType === 1
                  ? n.tagName.toLowerCase() + (n.id ? '#' + n.id : '') + (typeof n.className === 'string' && n.className ? '.' + n.className.trim().split(/\s+/)[0] : '')
                  : '?';
                return `${name} ${Math.round(x.previousRect.y)}→${Math.round(x.currentRect.y)}`;
              }),
            });
          }
        }).observe({ type: 'layout-shift', buffered: true });
      });
      await page.goto(`http://127.0.0.1:${s.port + 300}${p}`, { waitUntil: 'networkidle0', timeout: 90000 }).catch(() => {});
      await new Promise(r => setTimeout(r, 1500));
      const shifts = await page.evaluate(() => window.__shifts);
      const total = shifts.reduce((t, x) => t + x.v, 0);
      const big = shifts.filter(x => x.v > 0.005).map(x => `${x.v.toFixed(3)} [${x.src.slice(0, 3).join('; ')}]`);
      console.log(`${s.id} ${p} @${w}: CLS ${total.toFixed(3)}${big.length ? '  ' + big.join(' | ') : ''}`);
      await page.close();
    }
  }
  server.close();
}
await browser.close();
