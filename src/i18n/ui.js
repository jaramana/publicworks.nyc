/* ============================================================
   PUBLICWORKS.NYC: UI STRINGS (i18n)
   ------------------------------------------------------------
   Every piece of interface text lives here. The site ships in
   English only, served at the root (/). The dictionary and the
   path helpers stay in place so a second language is a new
   block below plus an entry in `languages`, not a rewrite.
   ============================================================ */

/* Which site this is. Every component reads these instead of naming the site,
   so the components stay identical between publicworks.nyc and cidadelabs.org. */
export const siteName = 'publicworks.nyc';
export const githubUrl = 'https://github.com/jaramana';
export const repoUrl = 'https://github.com/jaramana/publicworks.nyc';

// --spot when no project is in focus. null falls back to the ink color.
export const siteAccent = null;

// The footer's byline and sister-site lines. Their wording lives in works.js.
export const byline = { name: 'Allen Shaibani', url: 'https://allenshaibani.com' };
export const sister = { name: 'Cidade Labs', url: 'https://cidadelabs.org' };

export const languageNames = { en: 'English' };
export const locales = { en: 'en-US' };

export const languages = ['en'];
export const defaultLang = 'en';

export const ui = {
  en: {
    'nav.projects': 'Projects',
    'nav.blog': 'Journal',
    'nav.about': 'About',
    'tagline': 'An index of projects across websites, data and GIS.',
    'projects.title': 'Projects',
    'projects.lede': 'Each project links to the thing itself and, where there is one, to its repository.',
    'blog.title': 'Journal',
    'blog.lede': 'Notes on the work.',
    'about.title': 'About',
    'readmore': 'Read',
    'project.status.live': 'Available',
    'project.status.soon': 'In progress',
    'project.status.idea': 'Planned',
  },
};

/* Helper: get a translator function for a given language.
   Falls back to English if a string is missing. */
export function useTranslations(lang) {
  return function t(key) {
    return ui[lang]?.[key] ?? ui['en'][key] ?? key;
  };
}

/* Helper: strip a language subfolder prefix (e.g. "en/") from a
   content collection slug, so translated posts share the same
   bare URL path as the original. */
export function stripLangPrefix(slug, lang) {
  return slug.replace(new RegExp('^' + lang + '/'), '');
}

/* Helper: build a URL-prefixed path for a language.
   en (default) → /path   ·   anything else → /<lang>/path */
export function localizePath(path, lang) {
  const clean = path.replace(/^\/+|\/+$/g, '');
  if (lang === defaultLang) return '/' + (clean ? clean + '/' : '');
  return '/' + lang + '/' + (clean ? clean + '/' : '');
}
