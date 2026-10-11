/* Cut each work's close-up from its screenshot.

   A record with a cover and a focus gets media/close/<cover name>, the part
   of the cover its tile shows, and a closeUp line pointing at it. Run it after
   changing a cover or a focus. Languages that share a cover share the file.

   focus: { x, y, zoom }  x and y are the point held in place, in percent
   from the top-left; zoom is how many times smaller than the cover the
   close-up is on each side.

   Usage: node tools/closeups.mjs */

import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, basename, resolve } from 'node:path';
import sharp from 'sharp';

const root = resolve(dirname(new URL(import.meta.url).pathname), '..');
const done = new Set();

for (const site of readdirSync(join(root, 'sites'))) {
  const projects = join(root, 'sites', site, 'projects');
  let files;
  try { files = readdirSync(projects).filter(f => f.endsWith('.md')); } catch { continue; }

  for (const file of files) {
    const path = join(projects, file);
    let text = readFileSync(path, 'utf8');
    const cover = text.match(/^cover:\s*"([^"]+)"/m)?.[1];
    const focus = text.match(/^focus:\s*\{\s*x:\s*([\d.]+),\s*y:\s*([\d.]+),\s*zoom:\s*([\d.]+)\s*\}/m);
    if (!cover || !focus) continue;

    const [x, y, zoom] = focus.slice(1).map(Number);
    const source = resolve(projects, cover);
    const closeUp = `../media/close/${basename(cover)}`;
    const target = resolve(projects, closeUp);

    if (!done.has(target)) {
      const { width, height } = await sharp(source).metadata();
      const w = Math.round(width / zoom), h = Math.round(height / zoom);
      const left = Math.round((width - w) * x / 100), top = Math.round((height - h) * y / 100);
      mkdirSync(dirname(target), { recursive: true });
      await sharp(source).extract({ left, top, width: w, height: h }).png().toFile(target);
      done.add(target);
      console.log(`${site}/media/close/${basename(cover)}  ${w}×${h}`);
    }

    const line = `closeUp: "${closeUp}"`;
    if (/^closeUp:.*$/m.test(text)) text = text.replace(/^closeUp:.*$/m, line);
    else text = text.replace(/^(focus:.*)$/m, `$1\n${line}`);
    writeFileSync(path, text);
  }
}
