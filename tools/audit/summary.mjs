// Turns the per-site JSON reports in a folder into one Markdown summary.
// Usage: node summary.mjs <report folder>

import fs from 'node:fs';
import path from 'node:path';

const min = xs => xs.length ? Math.min(...xs) : '–';

function scoreLine(lh, form) {
  const runs = Object.values(lh || {}).map(r => r[form]).filter(r => r?.scores);
  if (!runs.length) return '–';
  return ['performance', 'accessibility', 'best-practices', 'seo'].map(k => min(runs.map(r => r.scores[k]).filter(v => v != null))).join(' / ');
}

// Lighthouse audits left out of the summary. GitHub Pages sets cache
// lifetimes, and minifying would need a build step the sites do not have.
const LH_QUIET = new Set([
  'unminified-css', 'unminified-javascript', 'cache-insight', 'uses-long-cache-ttl',
  'network-dependency-tree-insight', 'render-blocking-insight', 'render-blocking-resources',
]);

function findings(r) {
  const seen = new Map();
  const pages = (r.pages || []).filter(p => !p.error);
  const add = (where, what) => {
    if (!seen.has(what)) seen.set(what, []);
    seen.get(what).push(where);
  };
  for (const p of r.pages || []) {
    if (p.error) { add(p.url, `check failed, ${p.error}`); continue; }
    for (const c of p.contract) add(p.url, c);
    for (const a of Object.values(p.axe || {})) for (const v of a.violations)
      add(p.url, `axe ${v.id} (${v.impact}): ${v.sample.slice(0, 2).join(' | ')}`);
    const widths = Object.keys(p.reflow || {});
    if (widths.length) add(p.url, `scrolls sideways at ${widths.join(', ')}px: ${p.reflow[widths[0]].wide.join(', ')}`);
    for (const [w, k] of Object.entries(p.keyboard || {})) {
      if (k.noRing.length) add(p.url, `${w}px no focus indicator: ${k.noRing.join('; ')}`);
      if (k.covered.length) add(p.url, `${w}px focus covered: ${k.covered.join('; ')}`);
      if (k.hidden.length) add(p.url, `${w}px focus on invisible element: ${k.hidden.join('; ')}`);
      if (k.capped) add(p.url, `${w}px more than 250 tab stops`);
    }
    for (const [w, t] of Object.entries(p.targets || {})) if (t.length) add(p.url, `${w}px targets under 24px: ${t.join('; ')}`);
    if (p.spacing?.hScroll) add(p.url, 'text spacing causes sideways scroll');
    if (p.spacing?.clipped.length) add(p.url, `text spacing clips: ${p.spacing.clipped.join('; ')}`);
    if (p.media?.motion.running) add(p.url, `reduced motion leaves ${p.media.motion.running} animations running`);
    if (p.media?.motion.scrollBehavior === 'smooth') add(p.url, 'reduced motion keeps smooth scrolling');
    if (p.nojs && !p.nojs.noscript && (p.nojs.loadingOnly || p.nojs.text < 80)) add(p.url, `JavaScript off shows ${p.nojs.text} characters and no noscript note`);
    for (const e of p.errors) add(p.url, `console: ${e}`);
    for (const e of p.failed) add(p.url, `failed request: ${e}`);
    if (p.facts.h1 !== 1) add(p.url, `${p.facts.h1} h1 elements`);
    for (const k of p.facts.skips) add(p.url, `heading skip ${k}`);
    if (p.facts.brokenFragments.length) add(p.url, `same-page anchors with no target: #${p.facts.brokenFragments.join(', #')}`);
    // A page chosen by its query string carries no canonical, and The Blue Pages serves every
    // view from one page. No site has a share image yet.
    const canonical = !p.url.includes('?') && r.site !== 'bluepages';
    const wanted = ['description', ...(canonical ? ['canonical'] : []), 'ogTitle', 'ogDescription', 'icon'];
    const missing = wanted.filter(k => !p.facts[k]);
    if (missing.length && p.kind !== '404') add(p.url, `metadata missing: ${missing.join(', ')}`);
    if (p.facts.ogUrl) add(p.url, 'og:url sends shared links with a query or hash to the bare page');
  }
  for (const l of r.links?.broken || []) add('links', `broken link ${l}`);
  for (const [id, v] of Object.entries(r.html || {})) add('html', `html-validate ${id} ×${v.count}: ${v.sample.join('; ')}`);
  for (const [p, lh] of Object.entries(r.lighthouse || {})) for (const form of ['mobile', 'desktop']) {
    const x = lh[form];
    if (x?.error) { add(p, `Lighthouse ${form} failed: ${x.error}`); continue; }
    if (!x) continue;
    const below = Object.entries(x.scores).filter(([, v]) => v != null && v < 100);
    if (!below.length) continue;
    const loud = x.failing.filter(f => !LH_QUIET.has(f.id)).map(f => f.id + (f.value ? ` (${f.value})` : ''));
    add(p, `Lighthouse ${form} ${below.map(([k, v]) => `${k} ${v}`).join(', ')}; LCP ${(x.lcp / 1000).toFixed(1)} s, CLS ${x.cls.toFixed(3)}, TBT ${Math.round(x.tbt)} ms${loud.length ? '; ' + loud.join(', ') : ''}`);
  }
  return [...seen].map(([what, where]) => {
    const on = where.length > 1 && where.length === pages.length ? 'every page' : [...new Set(where)].join(', ');
    return `- ${what} — ${on}`;
  });
}

export function summarize(folder) {
  const reports = fs.readdirSync(folder).filter(f => f.endsWith('.json')).map(f => JSON.parse(fs.readFileSync(path.join(folder, f), 'utf8')));
  const lines = [`# Audit summary`, '', `Folder \`${path.basename(folder)}\`. Lighthouse scores are the lowest across a site's pages, in the order performance / accessibility / best practices / SEO.`, ''];
  lines.push('| Site | Pages | Mobile | Desktop | axe | html | Findings |', '| --- | --- | --- | --- | --- | --- | --- |');
  for (const r of reports) {
    const axe = (r.pages || []).reduce((n, p) => n + Object.values(p.axe || {}).reduce((m, a) => m + a.violations.length, 0), 0);
    const html = Object.values(r.html || {}).reduce((n, v) => n + v.count, 0);
    lines.push(`| ${r.name} | ${(r.pages || []).length} | ${scoreLine(r.lighthouse, 'mobile')} | ${scoreLine(r.lighthouse, 'desktop')} | ${axe} | ${html} | ${findings(r).length} |`);
  }
  for (const r of reports) {
    lines.push('', `## ${r.name}`, '');
    const f = findings(r);
    lines.push(...(f.length ? f : ['- No findings.']));
  }
  return lines.join('\n') + '\n';
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.stdout.write(summarize(path.resolve(process.argv[2])));
}
