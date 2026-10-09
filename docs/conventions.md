# Conventions

Notes that used to live in the README. The shared header, footer, boxes and
announcement banner apply to The Pay Gap, Hazard Historian, Schools Finder and
Chopper Noise. Wealth NYC and Wealth NJ use the same footer structure without a
Sources column, and their own masthead styling. Civil Service Exams and The
Blue Pages have their own chrome. The portfolio index has its own layout too. Follow each site's implementation
for those exceptions; do not copy the shared chrome into them by default.

## Adding a project

Copy a file in `sites/publicworks/projects/`, edit the frontmatter, save. The schema
is `src/content.config.ts`, and the build fails on a missing or misspelled field
or a `recordId` that another record already uses. If the record is a work, run
`npm run og` afterwards, because the share image lists the works by name.

```yaml
title: "What the visitor reads"
indexSummary: "One line, under the title on the tile and in the archive row."
description: "Not shown. Kept for a later cleanup."
category: "Data"          # Data, Map, Essay, Site or Tools
status: "works"           # works: a product in the public-works folder; archive: everything else
series: "redux"           # only for a past professional project rebuilt from public sources
recordId: "short-slug"    # the ?p= value
year: 2026
keywords: ["up", "to", "five", "words"]
builtWith: "What it was made with"   # omit the line entirely if nothing to list
url: "https://where-it-lives"
aboutUrl: "https://..."              # works only, when About is not url/about.html
dataUrl: "https://..."               # works only, when Data is not url/data.html
cover: "../media/short-slug.png"     # required for works
repository: "https://github.com/..." # omit when url is already the repository
source: "Who publishes the data"     # omit where the project names none
lead: "One sentence under the title in the note."  # without it the note repeats indexSummary
take: "The author's own take, 60 to 100 words."   # works only; the note's last page
specs:                               # the note shows the Data and Built with rows; others are kept, not shown
  - label: "Data"
    value: "..."
limit: "Not shown. Kept for a later cleanup."
updated: 2026-10-02                  # when the product's data was last built; without it the note has no Updated row
order: 1                             # order in Works, or within a category in the archive
draft: false
lang: "en"
```

The Markdown body below the frontmatter is not shown. The Pay Gap, Wealth NYC
and Chopper Noise keep their old narratives there for reference. A work's own
words go in `take:`, which the author writes. Never draft a take for them.

Screenshots live in `sites/publicworks/media/` and are converted to AVIF and WebP at
build time. A Redux record shows Redux in its meta line. About's Redux section
says it was rebuilt from public sources only and names it, so add each new one
there.

Categories are ordered in `src/entries.js`, and their labels live in
`sites/publicworks/copy.js`.
`builtWith` lists what the thing was actually made with. Claude is listed
exactly like R or MapLibre, because it was a tool like R or MapLibre. Projects
that predate it simply do not list it, which is what makes the field worth
reading.

## Adding a journal entry

A site's journal lives in `sites/<site>/journal/`, one Markdown file per entry
and language: `name.md` in the site's first language, `name.es.md` and so on
for the others. The file name without its language is the address,
`/blog/name/`. The body is the entry and may hold HTML figures; their styles
are in `src/styles/journal.css`, and pictures go in the site's
`public/journal/`. Folders and files with no entries show no Journal anywhere.

```yaml
title: "What the reader sees"
indexSummary: "One line in the home page's Journal list."
description: "The lead under the title, in the note and on the page."
pubDate: 2026-09-23
recordId: "short-slug"    # the ?p= value; shared with the projects
scope: "A Coruña"          # shown as Coverage; optional
source: "Who publishes the data"   # optional
repository: "https://github.com/..."   # optional
kind: "note"              # note or research; not shown
draft: false
lang: "gl"
```

## The portfolio page

The index is one page in its own design, separate from the product chrome
below. The styles are in `src/styles/works.css`.

| Part | Rule |
| --- | --- |
| Color | White page (`#fff`), `#161616` ink, `#6c6c70` muted, hairlines. Black and white only; the screenshots carry the color. Dark mode follows the system. |
| Type | PW Heros, regular weight. The wordmark and section titles are bold. Labels are 11px uppercase, tracked .08em, muted. |
| Project color | None. Records have no `accent` and the page has no `--spot`. |
| Tiles | Fluid. Each row shares its width, and no tile drops below 17rem, so rows always reach both edges. 8px radius, soft shadow, full-color screenshots. They lift 2px on hover, on devices that can hover. |
| Glass | The sticky masthead only: white at 72%, `saturate(180%) blur(18px)`. Opaque under reduced transparency. A hairline appears once the page scrolls. |
| Grid | Tiles and panel form one centered frame, up to 100rem wide. Columns follow from the 17rem minimum: one beside the panel from 51rem, two from about 71.5rem, three from about 94rem. |
| Panel | 25rem, from 51rem wide. It sticks under the masthead, fills the window's height and never scrolls. At rest it shows About. |
| Pages | A note turns in pages: Overview, then Details and Take where the record has them. About turns by its sections. In a short window Overview drops its thumbnail first; a page that still overflows continues on a "continued" page. |
| Under 51rem | A note opens whole under its tile, with no thumbnail and no pager. About sits after the archive. |
| Masthead | Nav links are ink, because tiles scroll under the glass on narrow screens. Under 30rem tall the masthead scrolls away. |
| Images | The tile's `sizes` in `Tile.astro` mirrors the grid. Change both together. Only the first tile's image has high priority. |
| Order | By `order`, lowest first. Ties, and records with no `order`, go by title. |
| Print | A plain list. Each work and archive row prints its address under the title; the panel and screenshots are hidden. |
| Share image | `sites/publicworks/public/og.png`, 1200×630: the wordmark, the intro and the works by name, drawn by `npm run og`. Names that don't fit on two lines end in "and N more". |
| Not found | `src/pages/404.astro`, with the shared masthead and footer. GitHub Pages serves it for any missing address. |
| Journal | A band between Works and the archive, rows like the archive's, newest first. A row opens a note whose first link is the entry. Entry pages share the masthead and footer; wide figures reach past the text to the frame. Two entry layouts are on trial until the owner picks: one centered column, and `?v=panel` with details and contents in the side panel. |

Hidden keys, none explained on the page: `/` finds, `j`, `k` and the arrow
keys move between tiles and rows, ← and → turn the panel's pages while
focus is in it, Esc returns the panel to About, shift-click opens the
repository, and typing 1999 shows the page as a plain list.

## The shared header

The three sites named above use the same masthead. The reference
implementation is `paygap.publicworks.nyc`. Copy it from there rather than
from memory. The index itself does not carry it: it is the cabinet, not one
of the drawers.

Markup: an empty `<header data-chrome="masthead">` that the site's own
`site.js` fills in, so the header is written once per project and not repeated
on every page.

```html
<div class="wrap masthead-inner">
  <a class="wordmark" href="index.html">Product Name</a>
  <nav class="nav" aria-label="Sections"> ... </nav>
</div>
```

The measurements are fixed. Changing any of them on one site alone is what
this section exists to prevent.

| Property | Value |
| --- | --- |
| `.masthead-inner` padding | `.55rem 0` |
| `.masthead-inner` gap | `1.25rem` |
| `.wordmark` size, weight, tracking | `1.25rem`, `700`, `-.03em` |
| `.nav` gap | `.15rem` |
| `.nav a` size, weight, padding | `.9rem`, `500`, `.35rem .6rem` |
| Rendered height, one row | 52.81px |

Two things, and only two, are allowed to differ between projects.

- **`--accent`.** The site's identity color, which carries the nav hover and
  the current-page state. Everything else reads from shared variables.
- **Controls the project actually needs.** The Pay Gap carries a theme toggle
  because it is the only site with a dark mode. A control like that sits
  inside `.nav`, after the links, and must not change the header's height.

The wordmark is the product name in plain English. It does not spell the
site's own address, and it does not carry `publicworks.nyc`: the portfolio is
a filing cabinet, and a link in the footer is the whole of what it needs.

On a phone the masthead does not scroll with the page. A sticky header costs
vertical space permanently, to save a scroll gesture that is cheap, and these
are reading and reference sites rather than applications.

On a desktop screen it does travel, on a layer of glass, because there the
52.81px it holds is space the page was not using. The gate is
`@media (min-width: 60rem) and (hover: hover)`: `hover` rules out a touch
screen and `60rem` rules out a desktop window too narrow to give the space
away. Below either, the bar is static and opaque, exactly as before.

| Property | Value |
| --- | --- |
| `--glass` | the site's `--paper` at `.82` alpha |
| `--glass-blur` | `saturate(140%) blur(14px)` |
| `--glass-edge` | `inset 0 1px 0 rgba(255, 255, 255, .9)` |
| `.masthead` when sticky | `top: 0`, `z-index: 30` |
| `--masthead-h` | `3.3rem`, the 52.81px above, named so other things can clear it |

Three things have to come with it, and a project that adopts the glass without
them is worse off than one that never did. Anchored links need
`scroll-padding-top: calc(var(--masthead-h) + 1rem)` or every `#section` link
opens with its own heading hidden behind the bar. Anything else the project
sticks to the top of the viewport has to clear `--masthead-h` too. And the bar
goes opaque under `prefers-reduced-transparency: reduce`, and static under
`@media (max-height: 34rem)`, which is what a reader at 200 per cent zoom has.

## Stable first paint

A slot that script fills holds its filled height from the first paint, so
the page under it does not jump. Each site keeps these rules in a "Stable first
paint" block in its stylesheet.

- The masthead slot, `header[data-chrome="masthead"]:empty`, holds the height
  the drawn masthead has at each width: one row, or the nav wrapping.
- Status lines, search boxes and other filled lines hold their measured height
  the same way.
- `main` is at least a screen tall, so the footer starts below the fold.
- A page whose body is all data carries `class="is-loading"` on `main`. Its
  sections stay hidden until the script draws them and removes the class.

The heights are measurements, not design values. Re-measure them when the nav,
the masthead or the filled text changes. `tools/audit/cls.mjs` names whatever
still moves. A page whose script draws the main content also carries a
`noscript` note pointing to the Data page.

## The footer

Four columns, then the colophon, then the portfolio mark on its own line.

| Column | What goes in it |
| --- | --- |
| Views | The tool pages: the things you do on the site. |
| Reference | `data.html` and `about.html`. Nothing else. |
| Sources | The upstream publishers, linked out. |
| Project | The repository and the issue tracker. Code, not pages. |

Column titles are `<h2 class="footer-head">`, set as small uppercase labels.
An `h4` there skipped levels in the page outline.

Every link points at a page. None points at a section within a page: four
entries that all open one page at a different anchor read as four
destinations and are one.

`publicworks.nyc` sits below the colophon in its own `.portfolio` line, outside
the columns, separated by a rule:

```html
<p class="portfolio">A <a href="https://publicworks.nyc/">publicworks.nyc</a> project.</p>
```

It is the cabinet these projects are filed in, not a section of any one site,
so it is announced once at the foot and does not compete with the site's own
navigation.

Every product ends with this exact line. Civil Service Exams and The Blue
Pages keep their own footer layouts. A view that fills the window carries the
line in its own foot bar instead: the Wealth maps and The Blue Pages' Org Chart. Civil Service Exams now uses the full independence
notice in its footer, naming DCAS as the authoritative publisher. Source dates
belong beside the data or in the source notes, never in the portfolio line.

## About pages

The eight products share the same core sections, in this order: Why,
Scope, Built, Independence, Credits, Reuse and Contact. A one-sentence lead sits
under the heading. Keep product-specific sections between Scope and Built where
they carry necessary facts: The Pay Gap has History, Schools Finder has Language
and Wealth NYC has Read the map. Sources, update schedules, data limits and
column definitions belong on the Data page, never on About.

Built describes tools and data methods. Updates belong on the Data page or in
the README. Independence says "No agency reviewed this site."
Credits names the data publishers and says "Claude was used in development."
Reuse covers the code license, source terms and any guidance needed to
republish figures. Contact points to the project's issue tracker.

Each product README uses the same section names for Data sources, Method and
limits, Updates, Tools, and License and reuse. Wealth NYC adds Verification
because it has tests. Its Tools paragraph matches
the About page's Built paragraph. The portfolio records use frontmatter only;
extra Markdown body copy is not displayed by the index.

## Data pages

Every product has a Data page at `data.html`. The skeleton and the reasoning
live in `alignment.md`. The visual parts are shared.

| Part | What it is |
| --- | --- |
| Downloads | `.downloads` grid of `.download` plain panels, each with an `h3` and one sentence. It is the same plain panel as in Boxes. |
| Columns | A `details.columns` directly under the downloads. It holds the column definitions, generated from the pipeline's dictionary. |
| Process | `ol.process`, a vertical numbered list. A filled accent circle carries the number, and a line joins the steps. Wealth NYC is the exception. It opens its Data page with Process, shown as two parallel calculations in cards, each with its own `ol.pipeline` and equation. |

One line gives the build date, written out and filled from the pipeline's
metadata: `<p class="data-note" id="built">`, reading "Data built 9 October
2026." It sits under the Downloads note and holds a `&nbsp;` until filled.
Civil Service Exams gives its "current as of" and "checked" dates at the top
instead, and The Blue Pages its snapshot date.

Section headings are single words. The order is Downloads, Sources, Process, an
optional product section, Limits. Anchors are `#downloads`, `#sources`,
`#process` and `#limits`. The old `method.html` and `methodology.html` URLs
remain as redirect stubs that keep the anchor.

## 404 pages

Every product has a `docs/404.html`, which GitHub Pages serves for any missing
address. It says the page was not found and links to the home page and the
Data page. A 404 page that sets `<base href="/">` so its links work from any
depth carries no skip link, because `#main` would resolve to the home page.

## Page metadata

Every product page carries these tags under its meta description. The 404
page and the redirect stubs are the exceptions.

| Tag | Content |
| --- | --- |
| `link rel="canonical"` | The page's `https://` address, `/` for the home page and the `.html` name for the rest |
| `og:title` | The page's `<title>` |
| `og:description` | The page's meta description |
| `og:type` | `website` |

- A page whose content is chosen by its query string, such as a school, an
  exam or an event, carries no canonical. One would tell search engines that
  every school is the same page. A query that only filters or sorts a page
  keeps the canonical. The Blue Pages serves every agency from one page, so it
  carries none.
- No page carries `og:url`. Facebook and LinkedIn treat it as the page's
  permanent address, so a shared link with a query or hash would open the
  bare page.
- No site has a share image yet. Add `og:image` with the portfolio's card
  images.

`tools/audit/` flags a page that breaks these rules.

## Boxes

There are two, they mean different things, and both are defined identically on
every site. Adding a third is how three sites end up with three card styles.

**Plain panel** — a static box: an informational panel, an entry point, a
download, a chapter link. It sits on the paper and does not float above it.

```css
background: var(--paper-raised);
border: 1px solid var(--rule);
border-radius: 10px;
box-shadow: var(--shadow-tight);
transition: border-color .15s ease;
/* hover */ border-color: var(--accent);
```

Used by `.panel` and `.jump a` (Hazard Historian), `.chapters a` (Pay Gap,
Schools Finder), `.download` and `.entry` (Schools Finder).

**Result card** — one row of a result set, where the left bar says "this is one
of many" and lights up as you move down the list.

```css
background: var(--paper-raised);
border: 1px solid var(--rule);
border-left: 3px solid var(--rule-strong);
border-radius: 0 8px 8px 0;
transition: border-left-color .12s ease, background .12s ease;
/* hover */ border-left-color: var(--accent); background: var(--paper-sunken);
```

Used by `.result-card` (Pay Gap).

The rule for choosing: if it is one of a set the reader asked for, it is a
result card. Everything else is a plain panel. Do not put the directional bar
on a box that is not a result.

`--shadow-tight` is one hairline lift with no ambient spread, and is the only
shadow a card carries. `--shadow`, which does spread, is reserved for `.card`
and for surfaces that genuinely float, like a search dropdown.

## The announcement banner

Each of the three sites covered by these conventions carries the same notice,
in a `.note-box` on the home page and nowhere else. Repeating it on Method or
About in different words reads as two different claims about one site.

```html
<p><strong>This is not an official product.</strong> It is an independent
initiative, not affiliated with, endorsed by, or produced by
<a href="URL">AGENCY</a> or the City of New York. Please refer to them for
authoritative information.</p>
```

It appears in exactly two places, and the words are identical in both:

- the home page, wrapped in a `.note-box`;
- the footer, as the `.colophon`, on every page.

The Blue Pages follows the same two placements in its own layout: a muted
notice below the four data counts on the directory home view, and the same
wording in the footer on every view. Its About view lists sources without
repeating the notice.

The `.note-box` is `max-width: 46rem` with `.85rem 1rem` padding, and it must
carry `.note-box p { max-width: none }`. Without that line the global
`p { max-width: var(--measure) }` holds the text to 34rem inside a 46rem box,
and the paragraph stops short of the box it sits in.

One thing changes per project: **AGENCY**, the body that publishes the official
version, linked to it. New York City Emergency Management; New York City Public
Schools. Where no agency sits between the project and the City — The Pay Gap
reads the City's own payroll — the sentence names the City once instead of
naming an agency and the City.

Leave the rest of the sentence alone. It carries the affiliation disclaimer and
the instruction to go elsewhere, and stops there. It does not enumerate the ways
the data can be wrong: that is what the Method page is for, and a home page that
opens by arguing against itself is not a way in.

Tool credits belong on the About pages, in the READMEs and in the portfolio
records. The footers do not carry build slogans.
