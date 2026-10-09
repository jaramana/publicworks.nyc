# publicworks.nyc

[publicworks.nyc](https://publicworks.nyc) is the index for this portfolio of
independent public-record tools and earlier data, GIS and website projects. It
is one page. The Works grid shows the current products, and the Archive lists
earlier projects, tools and the Cidade Labs maps. On a wide screen each record
opens in the panel beside the grid; on a narrow one it opens under its tile.
`?p=<recordId>` links to a record.

## Tools

Astro builds the static page from one Markdown file per project. The site uses
HTML, CSS, JavaScript and TypeScript, served from GitHub Pages. Screenshots are
converted to AVIF and WebP at build time by `astro:assets`. The type is PW
Heros, a subset of TeX Gyre Heros kept in `src/fonts`; its license and
manifest sit beside the files and are served at `/fonts/`. The page loads nothing from other hosts and
sets no cookies.

## Publishing

GitHub Actions builds the site and publishes it to GitHub Pages on pushes to
`main`. Project records live in `sites/publicworks/projects/`. The frontmatter
fills the tiles, the archive rows and the notes; the Markdown body is not shown.
The About panel is `sites/publicworks/about.md`. Adding a project is described in
[docs/conventions.md](docs/conventions.md), with the shared About-page and
README conventions for the product sites.

To preview locally:

```sh
npm install
npm run dev
```

Three local tools sit in `tools/`. None runs during the build.

| Command | What it does |
| --- | --- |
| `npm run og` | Redraws the share image, `sites/publicworks/public/og.png`, from the site's name, intro and works. Run it after adding, removing, renaming or reordering a work. |
| `node tools/shoot.mjs <url> <file>` | Screenshots a product for its cover. Needs Chrome running with `--remote-debugging-port=9222`. |
| `tools/audit/` | The standards audit for every product and both sites: Lighthouse, axe, markup, layout, keyboard and the suite's own rules. It has its own `npm install`; see its README. |

## One codebase, two sites

The site shares its origins with
[Cidade Labs](https://github.com/cidade-labs/website), and both sites build
from this repository. Shared code lives in
`src/`: components, styles, scripts, page templates, the record schema and the
fonts. Each site has a folder in `sites/` with its own files.

| File in `sites/publicworks/` | What it holds |
| --- | --- |
| `site.js` | Name, domain, links, languages and old addresses to redirect |
| `copy.js` | Page copy, one block per language |
| `about.md` | The About panel, plus `about.<lang>.md` for each other language |
| `projects/` | One Markdown record per project, per language |
| `journal/` | Journal entries, one file per language. Optional. |
| `media/` | Screenshots for the records |
| `public/` | Icons, `CNAME` and `og.png`, copied to the site as they are |

`SITE` picks the folder and defaults to `publicworks`, so `npm run dev` and
`npm run build` work as before. `SITE=<folder> npm run build` builds another
site into `dist-<folder>/`; publicworks.nyc builds into `dist/`. Shared code
imports the chosen site's files as `@site/site.js` and `@site/copy.js`.

A site's first language is served at `/`, and each other language at
`/<lang>/`. The masthead shows language links once a site has more than one.

`sites/cidadelabs/` holds Cidade Labs, in Galician at `/` and in Spanish and
English under `/es/` and `/en/`. `npm run dev:cidade` previews it and
`npm run build:cidade` builds it.

A site with a `journal/` folder gets a Journal band on its home page, a
Journal link in the masthead and a page per entry at `/blog/<name>/`. Its
pictures live in the site's `public/journal/`. publicworks.nyc has no journal
yet, so none of this shows there. Adding an entry is described in
[docs/conventions.md](docs/conventions.md).

Work on one site at a time. Both sites share Astro's `.astro/` folder, so
building one breaks the other's running dev server until it restarts.
