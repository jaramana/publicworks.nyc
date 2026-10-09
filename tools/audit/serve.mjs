// Static server that behaves like GitHub Pages: gzip, a ten-minute cache,
// extensionless .html, folder redirects and the site's own 404 page.
// Usage: node serve.mjs <docs folder> [port]

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.geojson': 'application/geo+json',
  '.csv': 'text/csv; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8', '.xml': 'application/xml', '.ics': 'text/calendar',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.pdf': 'application/pdf',
  '.zip': 'application/zip', '.webmanifest': 'application/manifest+json',
  '.pbf': 'application/x-protobuf',
};
const COMPRESS = /\.(html|css|m?js|json|geojson|csv|txt|md|xml|ics|svg|webmanifest)$/;

function resolve(root, pathname) {
  const rel = decodeURIComponent(pathname);
  const target = path.resolve(root, '.' + rel);
  if (target !== root && !target.startsWith(root + path.sep)) return { status: 404 };
  const stat = p => { try { return fs.statSync(p); } catch { return null; } };
  const s = stat(target);
  if (s?.isDirectory()) {
    if (!rel.endsWith('/')) return { status: 301, location: rel + '/' };
    if (stat(path.join(target, 'index.html'))) return { status: 200, file: path.join(target, 'index.html') };
  } else if (s?.isFile()) {
    return { status: 200, file: target };
  } else if (stat(target + '.html')) {
    return { status: 200, file: target + '.html' };
  }
  const notFound = path.join(root, '404.html');
  return { status: 404, file: stat(notFound) ? notFound : null };
}

export function serve(root, port) {
  root = path.resolve(root);
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const hit = resolve(root, url.pathname);
    if (hit.status === 301) {
      res.writeHead(301, { Location: hit.location + url.search });
      return res.end();
    }
    if (!hit.file) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('Not found');
    }
    let body = fs.readFileSync(hit.file);
    const headers = {
      'Content-Type': TYPES[path.extname(hit.file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'max-age=600',
      'Vary': 'Accept-Encoding',
    };
    if (COMPRESS.test(hit.file) && /\bgzip\b/.test(req.headers['accept-encoding'] || '')) {
      body = gzipSync(body);
      headers['Content-Encoding'] = 'gzip';
    }
    headers['Content-Length'] = body.length;
    res.writeHead(hit.status, headers);
    res.end(req.method === 'HEAD' ? undefined : body);
  });
  return new Promise(ok => server.listen(port, '127.0.0.1', () => ok(server)));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [root, port = 4400] = process.argv.slice(2);
  await serve(root, Number(port));
  console.log(`Serving ${root} at http://127.0.0.1:${port}/`);
}
