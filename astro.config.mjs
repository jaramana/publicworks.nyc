import { defineConfig } from 'astro/config';

export default defineConfig({
  // The production domain. The canonical link, share image, robots.txt and
  // sitemap all build from it.
  site: 'https://publicworks.nyc',

  build: {
    // Each page is a folder with an index.html, so addresses end in a slash.
    format: 'directory',

    // The styles are a few kilobytes, so they ship inside the page and
    // never hold up the first paint.
    inlineStylesheets: 'always',
  },
});
