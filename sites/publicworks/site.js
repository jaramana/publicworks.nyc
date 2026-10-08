/* ============================================================
   PUBLICWORKS.NYC: WHICH SITE THIS IS
   ------------------------------------------------------------
   The shared components in src/ read these instead of naming
   the site, so one set of components serves every folder in
   sites/. Page copy lives in copy.js.

   The site ships in English only, served at the root (/). A
   second language is an entry in `languages` plus a copy block
   in copy.js.
   ============================================================ */

export const siteName = 'publicworks.nyc';

// The production domain. The canonical link, share image, robots.txt and
// sitemap all build from it.
export const siteUrl = 'https://publicworks.nyc';

export const githubUrl = 'https://github.com/jaramana';
export const repoUrl = 'https://github.com/jaramana/publicworks.nyc';

// The footer's byline and sister-site lines. Their wording lives in copy.js.
export const byline = { name: 'Allen Shaibani', url: 'https://allenshaibani.com' };
export const sister = { name: 'Cidade Labs', url: 'https://cidadelabs.org' };

export const languageNames = { en: 'English' };
export const languages = ['en'];
export const defaultLang = 'en';
