# Conventions

Notes that used to live in the README. The shared header, footer, boxes and
announcement banner are portfolio-wide and apply to every project site, not
only to this index.

## Adding a project

Copy a file in `src/content/projects/`, edit the frontmatter, save.

```yaml
title: "What the visitor reads"
indexSummary: "One line, under the title in the index."
description: "The paragraph in the record."
category: "Data"          # Data, Map, Essay, Site or Tools
recordId: "short-slug"    # the ?p= value, and the screenshot name
year: 2026
keywords: ["up", "to", "five", "words"]
builtWith: "What it was made with"   # omit the line entirely if nothing to list
url: "https://where-it-lives"
shot: "/media/short-slug.png"        # omit for no screenshot
repository: "https://github.com/..." # omit when url is already the repository
source: "Who publishes the data"     # omit where the project names none
order: 1                             # order within the category
lang: "en"
```

Categories are ordered in `src/i18n/register.js`, which also holds the labels.
`builtWith` lists what the thing was actually made with. Claude is listed
exactly like R or MapLibre, because it was a tool like R or MapLibre. Projects
that predate it simply do not list it, which is what makes the field worth
reading.

## The shared header

Every project under this portfolio uses the same masthead, so moving between
them does not feel like moving between strangers. The reference implementation
is `paygap.publicworks.nyc`. Copy it from there rather than from memory. The
index itself does not carry it: it is the cabinet, not one of the drawers.

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

## The footer

Four columns, then the colophon, then the portfolio mark on its own line.

| Column | What goes in it |
| --- | --- |
| Views | The tool pages: the things you do on the site. |
| Reference | `method.html` and `about.html`. Nothing else. |
| Sources | The upstream publishers, linked out. |
| Project | The repository and the issue tracker. Code, not pages. |

Every link points at a page. None points at a section within a page: four
entries that all open `method.html` at a different anchor read as four
destinations and are one.

`publicworks.nyc` sits below the colophon in its own `.portfolio` line, outside
the columns, separated by a rule:

```html
<p class="portfolio">A <a href="https://publicworks.nyc">publicworks.nyc</a> project</p>
```

It is the cabinet these projects are filed in, not a section of any one site,
so it is announced once at the foot and does not compete with the site's own
navigation.

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

Used by `.result-card` (Pay Gap) and `.school-card` (Schools Finder).

The rule for choosing: if it is one of a set the reader asked for, it is a
result card. Everything else is a plain panel. Do not put the directional bar
on a box that is not a result.

`--shadow-tight` is one hairline lift with no ambient spread, and is the only
shadow a card carries. `--shadow`, which does spread, is reserved for `.card`
and for surfaces that genuinely float, like a search dropdown.

## The announcement banner

Every project that reconstructs an official record carries the same notice, in
a `.note-box` on the home page and nowhere else. Repeating it on Method or
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

The build credit is not part of it. `Public data, public method, built with X`
and whatever wink follows it belong in a `.built-with` line beneath the
colophon, so the disclaimer stays byte-identical across the suite while each
project keeps its own voice.
