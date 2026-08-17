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
is `schools.publicworks.nyc`. Copy it from there rather than from memory.

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

The masthead does not scroll with the page. A sticky header costs vertical
space on a phone permanently, to save a scroll gesture that is cheap, and
these are reading and reference sites rather than applications.

## Accessibility

Semantic HTML, real links to real destinations, full keyboard operation,
visible focus, and no information that is available only on hover.
`prefers-reduced-motion` and `prefers-reduced-transparency` are both honored.
With CSS and JavaScript switched off, every project is still reachable as a
plain list of links.

## Credits

Built with plain HTML, CSS and JavaScript, with no framework and no build step.
Screenshots captured with headless Chrome. Written with Claude.
