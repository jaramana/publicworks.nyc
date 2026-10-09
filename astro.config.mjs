import { defineConfig } from 'astro/config';
import { existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { site } from './src/current-site.js';

// The chosen site's folder: its records, copy, screenshots and public files.
const dir = fileURLToPath(new URL(`./sites/${site}/`, import.meta.url));
if (!existsSync(dir)) throw new Error(`SITE is "${site}", but there is no sites/${site}/ folder.`);
const { siteUrl, redirects = {}, languages, defaultLang } = await import(new URL(`./sites/${site}/site.js`, import.meta.url).href);

// A site with journal entries sends /blog/, the journal's old list page, to
// the Journal on the home page, in each language.
const journal = new URL('journal/', `file://${dir}`);
const hasJournal = existsSync(journal) && readdirSync(journal).some(f => f.endsWith('.md'));
const blogRedirects = hasJournal ? Object.fromEntries(languages.map(lang => {
  const home = lang === defaultLang ? '/' : `/${lang}/`;
  return [`${home}blog`, `${home}#journal`];
})) : {};

export default defineConfig({
  // The production domain, from the site's site.js.
  site: siteUrl,

  // Old addresses that now lead elsewhere, from the site's site.js.
  redirects: { ...blogRedirects, ...redirects },

  // Icons, CNAME and share image. Shared files like the fonts live in src/.
  publicDir: `./sites/${site}/public`,

  // publicworks.nyc builds to dist/, where the deploy workflow looks. Other sites build beside it.
  outDir: site === 'publicworks' ? './dist' : `./dist-${site}`,

  build: {
    // Each page is a folder with an index.html, so addresses end in a slash.
    format: 'directory',

    // The styles are a few kilobytes, so they ship inside the page and
    // never hold up the first paint.
    inlineStylesheets: 'always',
  },

  vite: {
    // Shared code imports the chosen site's files as @site/site.js and @site/copy.js.
    resolve: { alias: { '@site': dir } },
  },
});
