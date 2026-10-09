// Serve a built dist/ folder and screenshot fixed states at fixed widths:
// home, About's pages, a work, an archive row and the 404 at 375, 780, 1280
// and 1920px, plus dark mode and print. NOIMG=1 hides pictures.
// Usage: node shots.mjs <dist> <outDir> [port]
// Needs puppeteer-core, pixelmatch and pngjs installed beside it.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const [dist, out, port = '4391'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });

const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.avif': 'image/avif', '.webp': 'image/webp',
  '.png': 'image/png', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.xml': 'application/xml',
  '.txt': 'text/plain', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };

const server = http.createServer((req, res) => {
  let p = path.join(dist, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
  let status = 200;
  if (!fs.existsSync(p)) { p = path.join(dist, '404.html'); status = 404; }
  res.writeHead(status, { 'Content-Type': types[path.extname(p)] ?? 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
}).listen(Number(port));
const base = `http://127.0.0.1:${port}`;

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--font-render-hinting=none', '--hide-scrollbars'],
});

const wait = ms => new Promise(r => setTimeout(r, ms));

async function open(url, width, { dark = false } = {}) {
  const page = await browser.newPage();
  await page.setViewport({ width, height: 900 });
  await page.emulateMediaFeatures([
    { name: 'prefers-reduced-motion', value: 'reduce' },
    { name: 'prefers-color-scheme', value: dark ? 'dark' : 'light' },
  ]);
  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);

  // NOIMG=1 hides pictures, leaving only layout and CSS to compare.
  if (process.env.NOIMG) await page.addStyleTag({ content: 'img { visibility: hidden !important; }' });

  // Load every lazy image, then return to the top.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); }
    window.scrollTo(0, 0);
  });
  await page.waitForNetworkIdle({ idleTime: 300 });
  await page.evaluate(() => Promise.race([
    Promise.all([...document.images].filter(i => i.complete || i.loading !== 'lazy').map(i => i.decode().catch(() => {}))),
    new Promise(r => setTimeout(r, 2000)),
  ]));
  await wait(300);
  return page;
}

const shot = (page, name, fullPage = false) => page.screenshot({ path: path.join(out, name + '.png'), fullPage });

// Turn the panel through every page, one screenshot per page.
async function pages(page, prefix) {
  const seen = new Set();
  for (let i = 0; i < 10; i++) {
    const label = await page.$eval('[data-pager-label]', el => el.textContent.trim()).catch(() => '');
    if (seen.has(label)) break;
    seen.add(label);
    await shot(page, `${prefix}-p${i + 1}`);
    await page.evaluate(() => document.querySelector('[data-turn="1"]')?.click());
    await wait(250);
  }
}

for (const width of [375, 780, 1280, 1920]) {
  const wide = width >= 816;

  let page = await open(base + '/', width);
  await shot(page, `${width}-home`, true);
  if (wide) await pages(page, `${width}-about`);
  await page.close();

  // The first work, then the first archive row.
  for (const [name, sel] of [['work', '#works a[data-open]'], ['archive', '#archive a[data-open]']]) {
    page = await open(base + '/', width);
    await page.evaluate(s => document.querySelector(s).click(), sel);
    await wait(400);
    if (wide) await pages(page, `${width}-${name}`);
    else await shot(page, `${width}-${name}`, true);
    await page.close();
  }

  page = await open(base + '/no-such-page/', width);
  await shot(page, `${width}-404`, true);
  await page.close();
}

for (const width of [375, 1280]) {
  const page = await open(base + '/', width, { dark: true });
  await shot(page, `${width}-dark`, true);
  await page.close();
}

{
  const page = await open(base + '/', 1280);
  await page.emulateMediaType('print');
  await wait(300);
  await shot(page, `1280-print`, true);
  await page.close();
}

await browser.close();
server.closeAllConnections(); server.close();
console.log(fs.readdirSync(out).filter(f => f.endsWith('.png')).length + ' screenshots in ' + out);
