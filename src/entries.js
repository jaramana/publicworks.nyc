/* ============================================================
   WHAT THE PAGE HOLDS
   ------------------------------------------------------------
   The only file that knows where records come from and how they
   are grouped. The components draw whatever this returns, and a
   field left out here does not appear on the page.
   ============================================================ */
import { getCollection } from 'astro:content';
import { existsSync } from 'node:fs';
import { site } from './current-site.js';
import { workPages, languages, siteUrl } from '@site/site.js';
import { localizePath } from './i18n.js';

const categories = ['Data', 'Map', 'Essay', 'Site', 'Tools'];

// English dates read day first, as across the suite.
export const dates = lang => new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : lang, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

const page = (base, path) => new URL(path, base.endsWith('/') ? base : base + '/').href;

// An address as it reads on paper: no scheme, query or trailing slash.
const bare = href => href.replace(/^https?:\/\//, '').replace(/[?#].*$/, '').replace(/\/$/, '');

// A journal entry's address: /blog/ and its file name without the language.
export const journalSlug = entry => entry.filePath.split('/').pop().replace(new RegExp(`(\\.(${languages.join('|')}))?\\.md$`), '');
export const journalPath = (entry, lang = entry.data.lang) => localizePath('/blog/' + journalSlug(entry), lang);

// Published journal entries, newest first. Every language unless one is named.
// A site without a journal/ folder has none, and Astro is spared the question.
const hasJournal = existsSync(`./sites/${site}/journal`);
export async function getJournal(lang) {
  if (!hasJournal) return [];
  return (await getCollection('journal', e => !e.data.draft && (!lang || e.data.lang === lang)))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export async function buildIndex(lang, t) {
  const label = Object.fromEntries(categories.map(c => [c, t[c.toLowerCase()]]));
  const date = dates(lang);

  const records = (await getCollection('projects', p => p.data.lang === lang && !p.data.draft)).map(p => {
    const d = p.data;
    const isWork = d.status === 'works';
    const code = d.repository ?? (d.url?.startsWith('https://github.com/') ? d.url : undefined);

    // The note's rows: Data, Built with and Updated, in that order, where the
    // record has them. A hand-written spec row wins over the plain field.
    const given = Object.fromEntries((d.specs ?? []).map(s => [s.label, s.value]));
    const specs = [
      { label: t.source, value: given[t.source] ?? d.source },
      { label: t.built, value: given[t.built] ?? d.builtWith },
      { label: t.updated, value: d.updated && date.format(d.updated) },
    ].filter(s => s.value);

    // Outbound links. A work links to its site, About, Data and code.
    // Where a site's works have no such pages, only the ones a record names.
    const links = [];
    if (d.url && d.url !== code) links.push({ label: isWork ? t.openSite : t.openRecord, href: d.url });
    if (isWork && d.url) {
      const about = d.aboutUrl ?? (workPages && page(d.url, 'about.html'));
      const data = d.dataUrl ?? (workPages && page(d.url, 'data.html'));
      if (about) links.push({ label: t.aboutPage, href: about });
      if (data) links.push({ label: t.dataPage, href: data });
    }
    if (code) links.push({ label: t.code, href: code });

    return {
      key: d.recordId,
      status: d.status,
      order: d.order,
      title: d.title,
      summary: d.indexSummary,
      category: d.category,
      year: d.year,
      meta: [d.year, label[d.category]].filter(Boolean).join(' · '),
      cover: d.cover,
      lead: d.lead,
      take: isWork ? d.take : undefined,
      repository: code,
      address: (d.url ?? code) && bare(d.url ?? code),
      specs,
      links,
      find: [d.title, d.indexSummary, label[d.category], d.builtWith, d.source, ...d.keywords, d.series].filter(Boolean).join(' ').toLowerCase(),
    };
  });

  // Journal entries open a note like any record. Its first link is the entry.
  const journal = (await getJournal(lang)).map(e => {
    const d = e.data;
    const href = journalPath(e);
    return {
      key: d.recordId,
      title: d.title,
      summary: d.indexSummary,
      year: d.pubDate.getUTCFullYear(),
      meta: date.format(d.pubDate),
      lead: d.description,
      repository: d.repository,
      address: bare(new URL(href, siteUrl).href),
      specs: [
        { label: t.coverage, value: d.scope },
        { label: t.sources, value: d.source },
      ].filter(s => s.value),
      links: [{ label: t.read, href }, d.repository && { label: t.code, href: d.repository }].filter(Boolean),
      find: [d.title, d.indexSummary, d.description, d.scope, d.source, t.journal].filter(Boolean).join(' ').toLowerCase(),
    };
  });

  // Two records with one recordId would share a ?p= link.
  const seen = new Set();
  for (const r of [...records, ...journal]) {
    if (seen.has(r.key)) throw new Error(`Two records use recordId "${r.key}".`);
    seen.add(r.key);
  }

  // Lower order first. Ties, and records with no order, go by title.
  const byOrder = (a, b) => a.order - b.order || a.title.localeCompare(b.title);

  const works = records.filter(r => r.status === 'works').sort(byOrder);

  // The archive is grouped by type, in the category order above.
  const groups = categories
    .map(c => ({
      name: label[c],
      entries: records.filter(r => r.status === 'archive' && r.category === c).sort(byOrder),
    }))
    .filter(g => g.entries.length > 0);
  const archive = groups.flatMap(g => g.entries);

  return { works, archive, groups, journal };
}
