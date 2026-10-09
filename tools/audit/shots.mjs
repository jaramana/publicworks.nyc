// Full-page screenshots of every audited page at phone and desktop width,
// for a before-and-after pixel diff with compare.mjs. Animations are frozen
// and the caret hidden so two runs of one build match.
//
// Usage: node shots.mjs <out folder> [site ...]
// Set AUDIT_SUITE to shoot a copy of the suite instead of the working tree.

import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
import { SITES } from './sites.mjs';
import { serve } from './serve.mjs';

const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const [out, ...wanted] = process.argv.slice(2);
const sites = SITES.filter(s => (!wanted.length || wanted.includes(s.id)) && fs.existsSync(s.root));
const FREEZE = '*, *::before, *::after { animation-play-state: paused !important; transition: none !important; caret-color: transparent !important; }';

fs.mkdirSync(out, { recursive: true });
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
for (const s of sites) {
  const server = await serve(s.root, s.port + 200);
  for (const [p] of s.pages) {
    for (const [w, h] of [[375, 812], [1440, 900]]) {
      const page = await browser.newPage();
      await page.setViewport({ width: w, height: h });
      await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
      await page.goto(`http://127.0.0.1:${s.port + 200}${p}`, { waitUntil: 'networkidle2', timeout: 45000 }).catch(() => {});
      await page.addStyleTag({ content: FREEZE });
      await new Promise(r => setTimeout(r, 800));
      const name = `${s.id}${p.replace(/[^a-z0-9]+/gi, '-')}-${w}.png`.replace(/-+/g, '-');
      await page.screenshot({ path: path.join(out, name), fullPage: true });
      await page.close();
    }
  }
  server.close();
  console.log(`${s.id}: ${s.pages.length * 2} shots`);
}
await browser.close();
