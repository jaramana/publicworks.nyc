/* The sitemap. Add a path here when the site gains a page worth indexing. */

const paths = ['/'];

export function GET({ site }) {
  const urls = paths.map(p => `  <url><loc>${new URL(p, site)}</loc></url>`).join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
