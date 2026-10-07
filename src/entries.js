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

export async function buildIndex(lang, t) {
  const label = Object.fromEntries(categories.map(c => [c, t[c.toLowerCase()]]));

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
    const links = [];
    if (d.url && d.url !== code) links.push({ label: isWork ? t.openSite : t.openRecord, href: d.url });
    if (isWork && d.url) {
      links.push({ label: t.aboutPage, href: d.aboutUrl ?? page(d.url, 'about.html') });
      links.push({ label: t.dataPage, href: d.dataUrl ?? page(d.url, 'data.html') });
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
      meta: [d.year, label[d.category], d.series === 'redux' && t.redux].filter(Boolean).join(' · '),
      cover: d.cover,
      lead: d.lead,
      take: isWork ? d.take : undefined,
      repository: code,
      specs,
      links,
      find: [d.title, d.indexSummary, d.category, d.builtWith, d.source, ...d.keywords, d.series].filter(Boolean).join(' ').toLowerCase(),
    };
  });

  const works = records.filter(r => r.status === 'works').sort((a, b) => a.order - b.order);

  // The archive is grouped by type, in the category order above.
  const groups = categories
    .map(c => ({
      name: label[c],
      entries: records.filter(r => r.status === 'archive' && r.category === c).sort((a, b) => a.order - b.order),
    }))
    .filter(g => g.entries.length > 0);
  const archive = groups.flatMap(g => g.entries);

  return { works, archive, groups };
}
