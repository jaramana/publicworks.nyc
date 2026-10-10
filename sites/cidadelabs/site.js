/* ============================================================
   CIDADE LABS: WHICH SITE THIS IS
   ------------------------------------------------------------
   The shared components in src/ read these instead of naming
   the site. Page copy lives in copy.js.

   Galician is the default language, served at the root (/).
   Spanish and English live under /es/ and /en/. Each language
   has a copy block in copy.js, an About file and a record file
   per project.
   ============================================================ */

export const siteName = 'Cidade Labs';

// The production domain. The canonical link, share image, robots.txt and
// sitemap all build from it.
export const siteUrl = 'https://cidadelabs.org';


// The maps have no About or Data pages of their own.
export const workPages = false;

// The footer's byline and sister-site lines. Their wording lives in copy.js.
export const byline = { name: 'Allen Shaibani', url: 'https://allenshaibani.com' };
export const sister = { name: 'publicworks.nyc', url: 'https://publicworks.nyc' };

export const languageNames = { gl: 'Galego', es: 'Español', en: 'English' };
export const locales = { gl: 'gl-ES', es: 'es-ES', en: 'en-US' };
export const languages = ['gl', 'es', 'en'];
export const defaultLang = 'gl';

// The old About and Projects pages. About now opens on the home page.
export const redirects = {
  '/about': '/#record-about',
  '/es/about': '/es/#record-about',
  '/en/about': '/en/#record-about',
  '/projects': '/',
  '/es/projects': '/es/',
  '/en/projects': '/en/',
};
