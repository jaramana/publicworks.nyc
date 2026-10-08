/* Language helpers shared by every site. A site's languages are in its
   site.js, and its words in copy.js. */
import { defaultLang } from '@site/site.js';

/* A path in a language. The default → /path/, anything else → /<lang>/path/ */
export function localizePath(path, lang) {
  const clean = path.replace(/^\/+|\/+$/g, '');
  if (lang === defaultLang) return '/' + (clean ? clean + '/' : '');
  return '/' + lang + '/' + (clean ? clean + '/' : '');
}

/* Fill {name} slots in a string. */
export function fill(text, values) {
  return text.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? '');
}
