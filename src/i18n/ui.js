/* ============================================================
   PUBLICWORKS.NYC: WHICH SITE THIS IS
   ------------------------------------------------------------
   Every component reads these instead of naming the site, so
   the components stay identical between publicworks.nyc and
   cidadelabs.org. Page copy lives in works.js.

   The site ships in English only, served at the root (/). A
   second language is an entry in `languages` plus a copy block
   in works.js.
   ============================================================ */

export const siteName = 'publicworks.nyc';
export const githubUrl = 'https://github.com/jaramana';
export const repoUrl = 'https://github.com/jaramana/publicworks.nyc';

// The footer's byline and sister-site lines. Their wording lives in works.js.
export const byline = { name: 'Allen Shaibani', url: 'https://allenshaibani.com' };
export const sister = { name: 'Cidade Labs', url: 'https://cidadelabs.org' };

export const languageNames = { en: 'English' };
export const languages = ['en'];
export const defaultLang = 'en';

/* A path in a language. en (default) → /path/, anything else → /<lang>/path/ */
export function localizePath(path, lang) {
  const clean = path.replace(/^\/+|\/+$/g, '');
  if (lang === defaultLang) return '/' + (clean ? clean + '/' : '');
  return '/' + lang + '/' + (clean ? clean + '/' : '');
}
