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
    "archiveNote": "Earlier projects, tools and the Cidade Labs maps.",
    "redux": "Redux",
    "find": "Find",
    "findPlaceholder": "Title, place, data or tool",
    "findCount": "{n} of {total}",
    "findNone": "No match",
    "findArchive": "{n} found in the archive",
    "records": "Records",
    "record": "Project",
    "openSite": "Open site",
    "openRecord": "Open",
    "aboutPage": "About",
    "dataPage": "Data",
    "code": "Code",
    "source": "Data",
    "built": "Built with",
    "updated": "Updated",
    "take": "Take",
    "more": "More",
    "overview": "Overview",
    "details": "Details",
    "continued": "{label}, continued",
    "pages": "Pages",
    "pageOf": "{i} / {n} · {label}",
    "previousPage": "Previous page",
    "nextPage": "Next page",
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
