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
  shot: "media/short-slug.png",   // or null
  source: "https://github.com/..." // or null
}
```

Categories appear in the order they first occur in the file. Moving a run of
blocks reorders the drawer. The current categories are Data, Map, Essay,
Analysis, Site and Tools.

To make a screenshot:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --window-size=1200,900 --hide-scrollbars \
  --screenshot=media/NAME.png https://example.com
sips -Z 720 media/NAME.png
```

Headless Chrome cannot finish loading a WebGL map, so map tools need capturing
from a real browser window instead.

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

## Accessibility

Semantic HTML, real links to real destinations, full keyboard operation,
visible focus, and no information that is available only on hover.
`prefers-reduced-motion` and `prefers-reduced-transparency` are both honoured.
With CSS and JavaScript switched off, every project is still reachable as a
plain list of links.

## Credits

Built with plain HTML, CSS and JavaScript, with no framework and no build step.
Screenshots captured with headless Chrome. Written with Claude.
