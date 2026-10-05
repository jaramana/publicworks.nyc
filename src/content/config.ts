import { defineCollection, z } from 'astro:content';

/* ============================================================
   CONTENT COLLECTIONS
   ------------------------------------------------------------
   These define the "shape" of a project record and a blog post.
   To ADD A PROJECT: drop a .md file in src/content/projects/
   To ADD A POST:    create src/content/blog/, drop a .md file in
                     it, and restore the /blog page tree.
   Fill in the fields below at the top of each file (frontmatter).
   The Markdown body of a project is its narrative in the panel.
   ============================================================ */

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    indexSummary: z.string().optional(),
    pubDate: z.date(),
    author: z.string().default('publicworks.nyc'),
    lang: z.enum(['en']).default('en'),
    draft: z.boolean().default(false),
    source: z.string().optional(),
    repository: z.string().url().optional(),
  }),
});

const projects = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),

    // One line under the title on the tile and in the archive row.
    indexSummary: z.string(),

    // The paragraph in the panel when the record has no narrative.
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

    // The product's identity color, at 4.5:1 or better on black. Drives --spot.
    accent: z.string().regex(/^#[0-9a-f]{6}$/i).optional(),

    // Screenshot under src/assets. Required for works.
    cover: image().optional(),

    // Two to four captioned figures for the narrative.
    gallery: z.array(z.object({ src: image(), alt: z.string(), caption: z.string() })).max(4).optional(),

    // Label and value rows beside the narrative. Without them the panel
    // lists source, built with, updated and code.
    specs: z.array(z.object({ label: z.string(), value: z.string() })).optional(),

    // One sentence at the top of the panel.
    lead: z.string().optional(),

    // The stated limit. Must agree with the product's About and Data pages.
    limit: z.string().optional(),

    // When the product's data was last built. Set by hand.
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
  type: 'content',
  schema: z.object({
    title: z.string(),
    lead: z.string(),
  }),
});

export const collections = { blog, projects, pages };
