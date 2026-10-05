/* ============================================================
   WHAT THE PAGE HOLDS
   ------------------------------------------------------------
   The only file that knows where records come from and how they
   are grouped. The components draw whatever this returns, and a
   field left out here does not appear on the page.
   ============================================================ */
import { getCollection } from 'astro:content';

const categories = ['Data', 'Map', 'Essay', 'Site', 'Tools'];

const date = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

const page = (base, path) => new URL(path, base.endsWith('/') ? base : base + '/').href;

const shortRepo = href => href.replace('https://github.com/', '');

export async function buildIndex(lang, t) {
  const label = Object.fromEntries(categories.map(c => [c, t[c.toLowerCase()]]));

  const records = (await getCollection('projects', p => p.data.lang === lang && !p.data.draft)).map(p => {
    const d = p.data;
    const isWork = d.status === 'works';
    const code = d.repository ?? (d.url?.startsWith('https://github.com/') ? d.url : undefined);

    // Spec rows. Hand-written specs replace the defaults; Updated and Code always close the list.
    const specs = d.specs ? [...d.specs] : [
      d.source && { label: t.source, value: d.source },
      d.builtWith && { label: t.built, value: d.builtWith },
    ].filter(Boolean);
    if (d.updated) specs.push({ label: t.updated, value: date.format(d.updated) });
    if (code) specs.push({ label: t.code, value: shortRepo(code), href: code });

    // Outbound links. A work links to its site, About, Data and code.
    const links = [];
    if (d.url && d.url !== code) links.push({ label: isWork ? t.openSite : t.openRecord, href: d.url });
    if (isWork && d.url) {
      links.push({ label: t.aboutPage, href: d.aboutUrl ?? page(d.url, 'about.html') });
      links.push({ label: t.dataPage, href: d.dataUrl ?? page(d.url, 'data.html') });
    }
    if (code) links.push({ label: t.code, href: code });

    return {
      key: d.recordId,
      entry: p,
      status: d.status,
      title: d.title,
      summary: d.indexSummary,
      description: d.description,
      category: d.category,
      group: label[d.category],
      year: d.year,
      meta: [d.year, label[d.category], d.series === 'redux' && t.redux].filter(Boolean).join(' · '),
      accent: d.accent,
      cover: d.cover,
      gallery: d.gallery,
      lead: d.lead,
      limit: d.limit,
      built: d.builtWith,
      source: d.source,
      repository: code,
      href: d.url,
      specs,
      links,
      hasBody: p.body.trim().length > 0,
      find: [d.title, d.indexSummary, d.category, d.builtWith, d.source, ...d.keywords, d.series].filter(Boolean).join(' ').toLowerCase(),
    };
  });

  const works = records.filter(r => r.status === 'works').sort((a, b) => a.entry.data.order - b.entry.data.order);

  // The archive is grouped by type, in the category order above.
  const groups = categories
    .map(c => ({
      name: label[c],
      entries: records.filter(r => r.status === 'archive' && r.category === c).sort((a, b) => a.entry.data.order - b.entry.data.order),
    }))
    .filter(g => g.entries.length > 0);
  const archive = groups.flatMap(g => g.entries);
  const years = archive.map(r => r.year);

  return { works, archive, groups, from: Math.min(...years), to: Math.max(...years) };
}
