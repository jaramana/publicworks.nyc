# publicworks.nyc

[publicworks.nyc](https://publicworks.nyc) is the index for this portfolio of
independent public-record tools and earlier data, GIS and website projects. Its
current New York City sites are [The Pay Gap](https://paygap.publicworks.nyc),
[NYC Hazard Historian](https://hazardhistorian.publicworks.nyc),
[Schools Finder](https://schools.publicworks.nyc),
[NYC Civil Service Exams](https://civilservice.publicworks.nyc) and
[The Blue Pages](https://bluepages.publicworks.nyc).

## Tools

Astro builds the static index from project frontmatter. The site uses HTML,
CSS, JavaScript and TypeScript, served from GitHub Pages.

## Publishing

GitHub Actions builds the site and publishes it to GitHub Pages on pushes to
`main`. Project records live in `src/content/projects/`; adding a record there
makes it available to the index. The index reads the frontmatter fields; it
does not display Markdown body text. The five current product sites share
About-page and README conventions in [docs/conventions.md](docs/conventions.md).

The site shares its codebase with
[Cidade Labs](https://github.com/cidade-labs/website). A change to shared behavior
or styling should be reviewed on both sites.
