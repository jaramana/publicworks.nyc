/* ============================================================
   WHAT THE INDEX HOLDS
   ------------------------------------------------------------
   The only file that knows where records come from and how they
   are grouped. Archive.astro draws whatever this returns, and a
   field left out here simply does not appear in the record.
   ============================================================ */
import { getCollection } from 'astro:content';

export async function buildIndex(lang, t) {
  // Categories group the index. The order here is the order of the drawer.
  const groups = [t.data, t.map, t.essay, t.site, t.tools];
  const label = { Data: t.data, Map: t.map, Essay: t.essay, Site: t.site, Tools: t.tools };

  const records = (await getCollection('projects', p => p.data.lang === lang))
    .sort((a, b) => a.data.order - b.data.order)
    .map(p => ({
      key: p.data.recordId,
      title: p.data.title,
      summary: p.data.indexSummary,
      body: p.data.description,
      group: label[p.data.category],
      year: p.data.year,
      kind: label[p.data.category] + ' · ' + p.data.year,
      keywords: p.data.keywords,
      built: p.data.builtWith,
      source: p.data.source,
      repository: p.data.repository,
      shot: p.data.shot,
      href: p.data.url,
      action: t.open,
    }));

  // The index files itself, in its own drawer, like everything else.
  const self = {
    key: 'this',
    title: t.this,
    summary: t.thisShort,
    body: t.thisBody,
    group: t.tools,
    year: 2026,
    kind: t.tools + ' · 2026',
    built: 'Astro, HTML, CSS, TypeScript',
    repository: 'https://github.com/jaramana/publicworks.nyc',
  };

  return { groups, entries: [...records, self] };
}
