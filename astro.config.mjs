import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Your production domain. Change this one line if the domain changes.
  site: 'https://publicworks.nyc',

  // English only, served at the root (/). The i18n scaffold in src/i18n
  // stays in place so a second language is a page tree plus a dictionary
  // block, not a rewrite.

  build: {
    // Cleaner URLs: /blog/x/ instead of /blog/x.html
    format: 'directory',
  },
});
