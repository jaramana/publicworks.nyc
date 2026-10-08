/* The font's license and manifest, served at /fonts/ beside the site. */
import license from '../../fonts/GUST-FONT-LICENSE.txt?raw';
import manifest from '../../fonts/MANIFEST-pw-heros.txt?raw';

const files = { 'GUST-FONT-LICENSE.txt': license, 'MANIFEST-pw-heros.txt': manifest };

export function getStaticPaths() {
  return Object.keys(files).map(file => ({ params: { file } }));
}

export function GET({ params }) {
  return new Response(files[params.file], { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
