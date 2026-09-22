# publicworks.nyc

An index of projects across websites, data and GIS.

The index is one page. Categories group a register of records, and selecting a
record holds it out on the right. English only, served at the root.

## Built with

Astro, HTML, CSS and TypeScript. No client framework runtime, no external
fonts, no analytics and no cookies.

## Design

The Graphite palette, Balanced spacing and the Folio mark. Light and dark
follow the system setting, with no control and nothing stored.

## Behavior

Selecting an entry updates `?p=record-id`, and browser history keeps the
selection. Arrow keys browse records, and Back to index clears the selection
and restores row focus. Keyboard focus stays visible. Without JavaScript every
record is still in the document.

## Deployment

GitHub Actions builds the site and publishes `dist/` to GitHub Pages on every
push to `main`.

## Sibling site

The codebase is shared with [cidadelabs.org](https://github.com/cidade-labs/website).
A change made on either site is meant to be carried across to the other.
