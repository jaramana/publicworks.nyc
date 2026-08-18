# publicworks.nyc

An index of projects across websites, data and GIS.

The site is one page. Categories sit at the left margin of a rail, the projects
filed under each sit indented behind it, and one card is held out at a time.
There is no navigation, no introduction and no description of the work.

## Files

| Path | What it is |
| --- | --- |
| `index.html` | The whole site. One file, styles and script included. |
| `projects.js` | Every project record. The only file you edit to change the index. |
| `media/` | Project screenshots, 720px wide PNGs. |
| `tools/shoot.mjs` | Screenshot capture. Not part of the site. |
| `exploration/` | The concepts and interaction studies that preceded the build. Not linked from the site. |

## Adding a project

Open `projects.js`, copy a block, edit it, save. Nothing runs and nothing
builds.

```js
{
  id: "short-slug",
  title: "What the visitor reads",
  url: "https://where-it-lives",
  category: "Data",
  year: 2026,
  keywords: ["up", "to", "five", "words"],
  built: "What it was made with",   // or null to hide the row
  shot: "media/short-slug.png",     // or null
  source: "https://github.com/..."  // or null
}
```

Categories appear in the order they first occur in the file. Moving a run of
blocks reorders the drawer. The current categories are Data, Map, Essay, Site
and Tools.

## Making a screenshot

Chrome's own `--screenshot` flag fires at the load event, which is far too
early for a map, and `--virtual-time-budget` deadlocks MapLibre because its Web
Worker never advances under virtual time. Both produce a picture of a loading
spinner. `tools/shoot.mjs` drives Chrome over the DevTools Protocol instead: it
waits for the network to go quiet, waits for any loading indicator to
disappear, and only then captures. It has no dependencies and needs only Node
18 or newer.

Start Chrome once with a debugging port open:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --remote-debugging-port=9222 --user-data-dir=/tmp/cdp-profile --no-first-run &
```

Then shoot as many pages as you like, and downscale:

```bash
node tools/shoot.mjs https://example.com media/NAME.png 1200 900 3000
sips -Z 720 media/NAME.png
```

The last argument is an extra wait in milliseconds after the page settles. Maps
want 4000 or more; ordinary pages are fine at the default.

## Running it locally

```bash
python3 -m http.server 8823
```

Then open `http://localhost:8823`. A server is needed because `projects.js` is
loaded as a script; opening `index.html` from the filesystem works in some
browsers but not reliably.

## Deploying

The site is static and served from the repository root by GitHub Pages.

1. Push to `main`.
2. Settings, Pages, source: deploy from branch `main`, folder `/ (root)`.
3. Point the domain at GitHub Pages and confirm the `CNAME` file matches.

`.nojekyll` is present so Pages serves the files as they are.

## The shared header

Every project under this portfolio uses the same masthead, so moving between
them does not feel like moving between strangers. The reference implementation
is `paygap.publicworks.nyc`. Copy it from there rather than from memory.

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

## Accessibility

Semantic HTML, real links to real destinations, full keyboard operation,
visible focus, and no information that is available only on hover.
`prefers-reduced-motion` and `prefers-reduced-transparency` are both honored.
With CSS and JavaScript switched off, every project is still reachable as a
plain list of links.

## Credits

Built with plain HTML, CSS and JavaScript, with no framework and no build step.
Screenshots captured with headless Chrome. Written with Claude.
