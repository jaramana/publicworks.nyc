# publicworks.nyc

[publicworks.nyc](https://publicworks.nyc) is the index for this portfolio of
independent public-record tools and earlier data, GIS and website projects. It
is one page. The Works grid shows the current products:
[Wealth NYC](https://wealth.publicworks.nyc),
[Chopper Noise](https://choppernoise.publicworks.nyc),
[The Pay Gap](https://paygap.publicworks.nyc),
[NYC Hazard Historian](https://hazardhistorian.publicworks.nyc),
[Schools Finder](https://schools.publicworks.nyc),
[NYC Civil Service Exams](https://civilservice.publicworks.nyc),
[The Blue Pages](https://bluepages.publicworks.nyc) and
[Wealth NJ](https://wealthnj.publicworks.nyc). A closed Archive drawer holds
earlier projects and the Cidade Labs tools. Each record opens in a panel over
the grid, and `?p=<recordId>` links to it.

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
the tiles, the archive rows and the panel's specs. The Markdown body, when there
is one, is the panel's narrative. The About panel is
`src/content/pages/about.md`. Adding a project is described in
[docs/conventions.md](docs/conventions.md), with the shared About-page and
README conventions for the product sites.

To preview locally:

```sh
npm install
npm run dev
```

The site shares its origins with
[Cidade Labs](https://github.com/cidade-labs/website). Since the October 2026
redesign the two no longer share layout code. Site-specific values (name,
links, languages, accent) live in `src/i18n/ui.js` and page copy in
`src/i18n/works.js`, so a Cidade Labs build can reuse the components with its
own config and records.
