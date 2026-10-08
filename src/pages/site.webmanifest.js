/* The web app manifest: the name and icon a phone uses when the site is saved
   to its home screen. Built from siteName, so another site on this code gets its own. */
import { siteName } from '@site/site.js';

export function GET() {
  const manifest = {
    name: siteName,
    short_name: siteName,
    icons: [
      { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    theme_color: '#ffffff',
    background_color: '#ffffff',
    display: 'browser',
  };
  return new Response(JSON.stringify(manifest, null, 2), { headers: { 'Content-Type': 'application/manifest+json' } });
}
