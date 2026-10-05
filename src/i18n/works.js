/* Page copy for the Works page. One block per language; English is the only one filed. */
export const works = {
  "en": {
    "intro": "Tools and maps built from public records in and around New York City.",
    "skip": "Skip to works",
    "sections": "Sections",
    "works": "Works",
    "archive": "Archive",
    "about": "About",
    "github": "GitHub",
    "count": "{works} works · {archive} in the archive",
    "archiveNote": "Earlier projects, tools and the Cidade Labs maps. {n} records, {from} to {to}.",
    "archiveOpen": "Show",
    "archiveClose": "Hide",
    "archiveTile": "The archive",
    "archiveTileNote": "{n} earlier projects, {from} to {to}",
    "redux": "Redux",
    "find": "Find",
    "findPlaceholder": "Title, place, data or tool",
    "findCount": "{n} of {total}",
    "findNone": "No match",
    "findArchive": "{n} found in the archive",
    "records": "Records",
    "record": "Project",
    "previous": "Previous",
    "next": "Next",
    "close": "Close",
    "of": "{i} of {n}",
    "limit": "Limit",
    "openSite": "Open site",
    "openRecord": "Open",
    "aboutPage": "About",
    "dataPage": "Data",
    "code": "Code",
    "source": "Data",
    "built": "Built with",
    "updated": "Updated",
    "backToWorks": "Back to works",
    "shotAlt": "Screenshot of {title}",
    "notice": "<strong>These are not official products.</strong> They are independent initiatives, not affiliated with, endorsed by, or produced by the agencies whose records they use or the City of New York. Please refer to those agencies for authoritative information.",
    "byline": "Made by <a href=\"{url}\">{name}</a>.",
    "sister": "<a href=\"{url}\">{name}</a> is the sister lab, in Galicia.",
    "sourceCode": "Source code",
    "privacy": "No cookies or analytics.",
    "place": "New York",
    "data": "Data",
    "map": "Map",
    "essay": "Essay",
    "site": "Site",
    "tools": "Tools"
  }
};

/* Fill {name} slots in a string. */
export function fill(text, values) {
  return text.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? '');
}
