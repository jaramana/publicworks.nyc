import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/* ============================================================
   CONTENT COLLECTIONS
   ------------------------------------------------------------
   The shape of a project record and of a page like About.
   To add a project, drop a .md file in src/content/projects/
   and fill in the fields below at the top (frontmatter).
   A project's Markdown body is not shown on the page.
   ============================================================ */

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: ({ image }) => z.object({
    title: z.string(),

    // One line under the title on the tile and in the archive row.
    indexSummary: z.string(),

    // Not shown on the page. Kept for a later cleanup.
    description: z.string(),

    // The type. Archive rows are grouped by it, in the order set by src/i18n/works.js.
    category: z.enum(['Data', 'Map', 'Essay', 'Site', 'Tools']),

    // works: a product in the public-works folder. archive: everything else.
    status: z.enum(['works', 'archive']),

    // redux: a past professional project rebuilt independently from public sources.
    series: z.enum(['redux']).optional(),

    // The ?p= value.
    recordId: z.string().regex(/^[a-z0-9-]+$/),

    // The year of the current version.
    year: z.number().int(),

    // Up to five short words, lowercase. Find searches them.
    keywords: z.array(z.string()).max(5),

    // What the thing was actually made with. Omit when there is nothing
    // to list, which is what makes the field worth reading.
    builtWith: z.string().optional(),

    // Where the project lives. Omit while it is still an idea.
    url: z.string().url().optional(),

    // The product's About and Data pages. Works default to
    // url + about.html and url + data.html.
    aboutUrl: z.string().url().optional(),
    dataUrl: z.string().url().optional(),

    // Omit when url already points at the repository.
    repository: z.string().url().optional(),

    // Data source credit, where a project names one.
    source: z.string().optional(),

    // Screenshot under src/assets. Required for works.
    cover: image().optional(),

    // Not shown on the page. Kept for a later cleanup.
    gallery: z.array(z.object({ src: image(), alt: z.string(), caption: z.string() })).max(4).optional(),

    // Label and value rows. The note shows the Data and Built with rows;
    // the others are kept for a later cleanup. Without specs the note
    // uses source and builtWith.
    specs: z.array(z.object({ label: z.string(), value: z.string() })).optional(),

    // One sentence under the title in the note. Without it the note repeats indexSummary.
    lead: z.string().optional(),

    // The author's own take on a work, 60 to 100 words, shown last in its note.
    take: z.string().optional(),

    // Not shown on the page. Kept for a later cleanup.
    limit: z.string().optional(),

    // When the product's data was last built. Set by hand. Without it the note has no Updated row.
    updated: z.date().optional(),

    // Order within Works, or within a category in the archive.
    order: z.number().default(99),

    // Hides the record from the build.
    draft: z.boolean().default(false),

    lang: z.enum(['en']).default('en'),
  }).refine(d => d.status !== 'works' || d.cover, { message: 'A work needs a cover.', path: ['cover'] }),
});

// Panels that are not projects. about.md is the About panel.
const pages = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    lead: z.string(),
  }),
});

export const collections = { projects, pages };
