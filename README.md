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
Heros, a subset of TeX Gyre Heros served from `public/fonts`; its license and
manifest sit beside the files. The page loads nothing from other hosts and
sets no cookies.

## Publishing

GitHub Actions builds the site and publishes it to GitHub Pages on pushes to
`main`. Project records live in `src/content/projects/`. The frontmatter fills
the tiles, the archive rows and the notes; the Markdown body is not shown. The
About panel is `src/content/pages/about.md`. Adding a project is described in
[docs/conventions.md](docs/conventions.md), with the shared About-page and
README conventions for the product sites.

To preview locally:

```sh
npm install
npm run dev
```

Two local tools sit in `tools/`. Neither runs during the build.

| Command | What it does |
| --- | --- |
| `npm run og` | Redraws the share image, `public/og.png`, from the site's name, intro and works. Run it after adding, removing, renaming or reordering a work. |
| `node tools/shoot.mjs <url> <file>` | Screenshots a product for its cover. Needs Chrome running with `--remote-debugging-port=9222`. |

## One codebase, two sites

The site shares its origins with
[Cidade Labs](https://github.com/cidade-labs/website). Site-specific values
(name, links, languages) live in `src/i18n/ui.js` and page copy in
`src/i18n/works.js`. The domain is `site` in `astro.config.mjs`; the canonical
link, share image, manifest, `robots.txt` and sitemap all build from these, so
a Cidade Labs build can reuse the components with its own config and records.
