# Audit kit

A standards audit for the eight products, publicworks.nyc and Cidade Labs. It runs on this machine only, never in GitHub Actions. Run it before publishing a change to any site.

## Install

```bash
npm install --cache /tmp/npm-cache
```

Run that inside `tools/audit/`. The cache flag is there because `~/.npm` holds root-owned files. Chrome must be installed at the usual macOS path, or set `CHROME_PATH`.

## Run

Build the portfolio first if it is in scope: `npm run build` and `npm run build:cidade` at the repository root. The product sites need no build; the kit serves their `docs/` folders.

```bash
node run.mjs paygap schools
```

With no site names it audits all ten. Site names, folders, ports and the pages audited are in `sites.mjs`. Each detail page carries a real ID from that site's data. Reports go to `reports/<date>/`, which Git ignores: one JSON file per site and `summary.md`. A full run takes about 35 minutes; one site takes three to five.

| Option | Effect |
| --- | --- |
| `--skip=lighthouse,checks,html,links` | Leave out any of the four parts |
| `--out=<folder>` | Write the reports somewhere else |
| `AUDIT_SUITE=<folder>` | Audit a copy of the suite instead of the working tree, so you can keep editing while a baseline runs |

Four more scripts sit beside the runner.

| Script | Use |
| --- | --- |
| `node cls.mjs <site>` | Layout shift under slow network and CPU, naming each element that moved. Lighthouse gives the score; this gives the cause. |
| `node shots.mjs <folder> <site>` | Full-page screenshots of every audited page at 375 and 1440px |
| `node compare.mjs <before> <after> <diffs>` | Pixel diff of two `shots.mjs` folders, with a diff image per changed page |
| `node serve.mjs <docs folder> <port>` | The local server on its own |

`serve.mjs` behaves like GitHub Pages: gzip, a ten-minute cache, `about` serving `about.html`, folder redirects and the site's `404.html`. Scores from it track the live sites closely.

To check that a fix changed nothing else, shoot before and after and compare. Map pages differ slightly between any two runs, because tiles draw in a different order.

## Portfolio checks

`portfolio/` holds five scripts from the portfolio's audit of 7 October 2026. They test things only the portfolio page has, so they stay separate from the runner. Run them from this folder against a served build, for example `node serve.mjs ../../dist 4409`.

| Script | Checks |
| --- | --- |
| `node portfolio/audit.mjs . <out> <url>` | axe with a note open, the keyboard walk around the panel, and media checks with the portfolio's own selectors |
| `node portfolio/glass.mjs . <url>` | Text contrast against the real pixels while tiles scroll under the glass masthead |
| `node portfolio/fixes.mjs . <url>` | Which image file each tile loads at several widths and screen densities |
| `node portfolio/detail.mjs . <url>` | axe's undecided results and target sizes inside an open note |
| `node portfolio/shots.mjs <dist> <out>` | 31 fixed states of a built site: About's pages, a work, an archive row, the 404, dark mode and print. Compare two sets with `compare.mjs`. |

## What it checks

| Check | How |
| --- | --- |
| Performance, accessibility, best practices, SEO | Lighthouse 13, mobile and desktop |
| Accessibility rules, WCAG 2.0 to 2.2 A and AA, best practice | axe-core 4 at 375 and 1440px, and in dark mode where a site has one |
| Markup | html-validate, recommended rules, every `.html` file the site serves |
| Reflow (1.4.10) | Sideways scroll at 11 widths from 320 to 2560px, naming what sticks out |
| Keyboard (2.4.7, 2.4.11) | Every tab stop at 375 and 1440px: a visible focus change, covered by a fixed or sticky layer, off screen |
| Target size (2.5.8) | Targets under 24px that fail both the inline and the spacing exceptions |
| Text spacing (1.4.12) | Test spacing applied: clipped text and sideways scroll |
| Media | Reduced motion, print |
| Robustness | JavaScript off, console errors, failed requests, other hosts, cookies and storage |
| Links | Every same-site link on the audited pages, fetched once; same-page anchors with no target |
| Metadata | Title, description, canonical, Open Graph, icons, one `h1`, heading levels |
| Suite contract | The `A publicworks.nyc project.` line, the home-page notice, About and Data heading order, one-word Data headings, the Data page date |

The contract checks follow `alignment.md` in the parent folder. Wealth's Data page is checked with Process first, its agreed exception.

## Reading the summary

The table gives the lowest Lighthouse score across a site's pages, in the order performance, accessibility, best practices, SEO. Findings that repeat on several pages are listed once, with the pages named.

The summary leaves out seven Lighthouse audits that no site change can fix. GitHub Pages sets cache lifetimes. Minifying and inlining would need a build step the product sites don't have. They are listed as `LH_QUIET` in `summary.mjs` and stay in the JSON.

## Baseline, 9 October 2026

The first full run, before and after that day's fixes. Each cell gives a site's lowest Lighthouse score or worst measure across its audited pages. Scores were taken on this machine with `serve.mjs`. What changed is listed in the parent folder's `HANDOFF.md`.

| Site | Performance, phone | Performance, desktop | Accessibility | SEO | Worst layout shift | Slowest phone LCP | axe rules failed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| The Pay Gap | 82 → 100 | 78 → 100 | 95 → 100 | 100 | 0.59 → 0.06 | 1.5 s | 3 → 0 |
| NYC Hazard Historian | 89 → 97 | 99 → 100 | 98 → 100 | 60 → 100 | 0.19 → 0.01 | 2.6 s | 1 → 0 |
| Schools Finder | 99 | 100 | 100 | 100 | 0.00 | 2.0 s → 1.8 s | 0 |
| NYC Civil Service Exams | 77 → 99 | 79 → 100 | 100 | 90 → 100 | 0.64 → 0.04 | 2.1 s | 0 |
| The Blue Pages | 95 | 97 → 98 | 97 → 100 | 100 | 0.03 | 2.9 s | 1 → 0 |
| Wealth NYC | 84 → 91 | 99 → 100 | 98 → 100 | 100 | 0.14 → 0.02 | 3.7 s → 3.5 s | 2 → 1 |
| Wealth NJ | 71 → 80 | 98 → 100 | 98 → 100 | 100 | 0.16 → 0.02 | 6.0 s → 5.6 s | 2 → 1 |
| Chopper Noise | 91 → 92 | 100 | 98 → 100 | 100 | 0.06 → 0.00 | 2.3 s → 1.2 s | 6 → 0 |
| publicworks.nyc | 99 | 100 | 100 | 100 | 0.00 | 2.3 s | 0 |
| Cidade Labs | 99 → 100 | 100 | 96 | 100 | 0.00 | 2.0 s → 1.9 s | 0 |

What still holds a score down:

- Wealth NYC and Wealth NJ, phone performance. The map's largest paint waits for its GeoJSON. The map file now carries only the fields the map reads, 496 KB compressed for New Jersey, and a preload starts it at once. Shapes are most of what remains.
- Hazard Historian's Event page, largest paint 2.6 s. The event file waits behind MapLibre, which loads first.
- The Blue Pages, phone performance 95. The agency rail loads full-size logos into 30-pixel thumbnails, about 1.3 MB more than it needs.
- Chopper Noise, phone performance 92. The map page's scripts block the main thread for about 350 ms on Lighthouse's slower phone.
- Cidade Labs, accessibility 96. The language links beside the wordmark are under 24 pixels on a phone. They are on trial until the owner picks a placement.

## Deliberate, not to fix

- html-validate's `doctype-style`, `void-style` and `no-trailing-whitespace` rules are off in `.htmlvalidate.json`. Both forms of each are valid HTML, and the sites differ.
- html-validate flags `role="list"` on the portfolio's lists as redundant. Safari's VoiceOver drops list semantics when bullets are hidden, and the role restores them.
- html-validate's `wcag/h32` asks for a submit button on Hazard Historian's Explore form. The query applies as you type and never changes context, so WCAG 3.2.2 is met without one.
- axe leaves symbol buttons "incomplete" for label-in-name: the portfolio pager's arrows, Schools' chip chevrons and Compare's × buttons. Each has a text name, and WCAG 2.5.3 doesn't apply to symbols.
- Lighthouse counts MapLibre as unused JavaScript on map pages. It loads only when a map is on screen.
- GitHub Pages can't set security headers. A `<meta>` CSP is optional and of low value for pages that load nothing from other hosts but map tiles.
- The metadata line is advisory. Canonical links and Open Graph tags are not yet a suite rule.
- The Blue Pages' agency rail holds 307 links on every view, so the keyboard walk passes 250 stops, and its group headings come before the view's `h1`. The skip link jumps past the rail. Wealth NJ's Data table does the same with 598 rows.
- Wealth's map pages put "Use the data table" beside the skip link, outside any landmark, so a keyboard user reaches the table before the map. axe calls this `region`.
- Schools clamps a long school description with a "Read the full description" button, and The Blue Pages' Org Chart is a clipped pan-and-zoom canvas. Text spacing clips both by design, and the full text stays reachable.
- The journal's images carry inline `aspect-ratio` styles from Astro, so pictures hold their space while loading.

## Not checked

- A real screen reader. axe and the keyboard walk cover the rules, not the listening experience.
- Safari and Firefox. Everything runs in Chrome.
- Real devices and a real slow connection. Mobile scores use Lighthouse's simulated slow 4G and a 4× slower CPU.
