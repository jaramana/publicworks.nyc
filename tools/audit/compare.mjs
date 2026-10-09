// Pixel diff of two shots.mjs folders. A pixel counts as changed when its
// color distance passes 0.0627, about 16 of 255, so antialiasing noise is
// ignored. Writes a diff image for each changed pair.
//
// Usage: node compare.mjs <before> <after> <diff folder>

import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const [before, after, diffs] = process.argv.slice(2);
fs.mkdirSync(diffs, { recursive: true });
const rows = [];
for (const name of fs.readdirSync(before).filter(f => f.endsWith('.png')).sort()) {
  const b = path.join(before, name), a = path.join(after, name);
  if (!fs.existsSync(a)) { rows.push([name, 'missing after']); continue; }
  const x = PNG.sync.read(fs.readFileSync(b)), y = PNG.sync.read(fs.readFileSync(a));
  if (x.width !== y.width || x.height !== y.height) {
    rows.push([name, `size ${x.width}×${x.height} → ${y.width}×${y.height}`]);
    continue;
  }
  const d = new PNG({ width: x.width, height: x.height });
  const n = pixelmatch(x.data, y.data, d.data, x.width, x.height, { threshold: 0.0627, includeAA: false });
  if (n) {
    fs.writeFileSync(path.join(diffs, name), PNG.sync.write(d));
    rows.push([name, `${n} pixels`]);
  }
}
console.log(rows.length ? rows.map(r => r.join(': ')).join('\n') : 'No visible changes.');
