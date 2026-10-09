// Audit runner. Serves each site locally, runs the browser checks,
// html-validate, a link check and Lighthouse, then writes one JSON report
// per site and a summary.
//
// Usage: node run.mjs [site ...] [--skip=lighthouse,checks,html,links] [--out=<folder>]

import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
import lighthouse from 'lighthouse';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';
import { launch } from 'chrome-launcher';
import { HtmlValidate } from 'html-validate';
import { SITES } from './sites.mjs';
import { serve } from './serve.mjs';
import { checkPage } from './check.mjs';
import { summarize } from './summary.mjs';

const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const args = process.argv.slice(2);
const flag = name => args.find(a => a.startsWith(`--${name}=`))?.split('=')[1];
const skip = new Set((flag('skip') || '').split(',').filter(Boolean));
const wanted = args.filter(a => !a.startsWith('--'));
const sites = SITES.filter(s => !wanted.length || wanted.includes(s.id));
const day = new Date().toISOString().slice(0, 10);
const out = path.resolve(flag('out') || path.join(import.meta.dirname, 'reports', day));
fs.mkdirSync(out, { recursive: true });

const say = msg => console.log(`[${new Date().toTimeString().slice(0, 8)}] ${msg}`);

// Every .html file the site serves, except vendored code.
function htmlFiles(root) {
  const found = [];
  const walk = dir => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory() && !['vendor', 'node_modules', 'lab', '_astro'].includes(e.name)) walk(p);
      else if (e.isFile() && e.name.endsWith('.html')) found.push(p);
    }
  };
  walk(root);
  return found;
}

async function validate(root) {
  const hv = new HtmlValidate(JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '.htmlvalidate.json'), 'utf8')));
  const rules = {};
  for (const file of htmlFiles(root)) {
    const report = await hv.validateFile(file);
    for (const res of report.results) for (const m of res.messages) {
      const r = (rules[m.ruleId] ||= { count: 0, sample: [] });
      r.count++;
      if (r.sample.length < 4) r.sample.push(`${path.relative(root, file)}:${m.line} ${m.message.slice(0, 110)}`);
    }
  }
  return rules;
}

// Same-host links from every audited page, fetched once each.
async function links(base, pages) {
  const urls = new Set();
  const missing = new Set(pages.filter(p => p.kind === '404').map(p => p.url));
  for (const p of pages) for (const l of p.linkList || []) {
    const u = new URL(l);
    if (u.origin === base && !missing.has(u.pathname)) urls.add(u.pathname + u.search);
  }
  const broken = [];
  for (const u of urls) {
    const res = await fetch(base + u, { redirect: 'follow' }).catch(e => ({ status: e.message }));
    if (res.status !== 200) broken.push(`${res.status} ${u}`);
  }
  return { checked: urls.size, broken };
}

async function lightrun(url, chrome) {
  const res = {};
  for (const form of ['mobile', 'desktop']) {
    const config = form === 'desktop' ? desktopConfig : undefined;
    const flags = { port: chrome.port, output: 'json', logLevel: 'error', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] };
    const r = await lighthouse(url, flags, config).catch(e => ({ error: e.message }));
    if (r.error || !r.lhr) { res[form] = { error: r.error || 'no result' }; continue; }
    const a = r.lhr.audits;
    res[form] = {
      scores: Object.fromEntries(Object.entries(r.lhr.categories).map(([k, v]) => [k, v.score == null ? null : Math.round(v.score * 100)])),
      lcp: a['largest-contentful-paint']?.numericValue, cls: a['cumulative-layout-shift']?.numericValue,
      tbt: a['total-blocking-time']?.numericValue, fcp: a['first-contentful-paint']?.numericValue,
      weight: a['total-byte-weight']?.numericValue,
      lcpElement: JSON.stringify(a['largest-contentful-paint-element']?.details || {}).match(/"snippet":"((?:[^"\\]|\\.)*)"/)?.[1]?.slice(0, 160),
      shifted: (a['layout-shifts']?.details?.items || []).slice(0, 4).map(i => i.node?.selector).filter(Boolean),
      failing: Object.values(a)
        .filter(x => x.score !== null && x.score < 0.9 && !['informative', 'notApplicable', 'manual'].includes(x.scoreDisplayMode))
        .map(x => ({ id: x.id, title: x.title, value: x.displayValue || '', items: (x.details?.items || []).slice(0, 3).map(i => i.url || i.node?.selector || i.source?.url || i.label || '').filter(Boolean) })),
    };
  }
  return res;
}

const servers = [];
for (const s of sites) {
  if (!fs.existsSync(s.root)) { say(`skip ${s.id}: ${s.root} not found (build it first)`); s.missing = true; continue; }
  servers.push(await serve(s.root, s.port));
}

const browser = skip.has('checks') ? null : await puppeteer.launch({ executablePath: CHROME, headless: true });
const chrome = skip.has('lighthouse') ? null : await launch({ chromePath: CHROME, chromeFlags: ['--headless=new', '--no-first-run'] });

for (const s of sites.filter(s => !s.missing)) {
  const base = `http://127.0.0.1:${s.port}`;
  const file = path.join(out, `${s.id}.json`);
  const report = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  Object.assign(report, { site: s.id, name: s.name, date: day });

  if (!skip.has('html')) {
    say(`${s.id}: html-validate`);
    report.html = await validate(s.root);
  }
  if (browser) {
    report.pages = [];
    for (const p of s.pages) {
      say(`${s.id}: checks ${p[0]}`);
      report.pages.push(await checkPage(browser, s, base, p).catch(e => ({ url: p[0], kind: p[1], error: e.message })));
    }
    if (!skip.has('links')) report.links = await links(base, report.pages);
    for (const p of report.pages) delete p.linkList;
  }
  if (chrome) {
    report.lighthouse = {};
    for (const [p, kind] of s.pages) {
      if (kind === '404') continue;
      say(`${s.id}: lighthouse ${p}`);
      report.lighthouse[p] = await lightrun(base + p, chrome);
    }
  }
  fs.writeFileSync(file, JSON.stringify(report, null, 1));
}

await browser?.close();
await chrome?.kill();
servers.forEach(s => s.close());
fs.writeFileSync(path.join(out, 'summary.md'), summarize(out));
say(`done: ${out}/summary.md`);
