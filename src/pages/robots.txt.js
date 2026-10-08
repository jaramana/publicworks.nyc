/* robots.txt, pointing crawlers at the sitemap on this site's own domain. */

export function GET({ site }) {
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', site)}\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
