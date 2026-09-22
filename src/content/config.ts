import { defineCollection, z } from 'astro:content';

/* ============================================================
   CONTENT COLLECTIONS
   ------------------------------------------------------------
   These define the "shape" of a project record and a blog post.
   To ADD A PROJECT: drop a .md file in src/content/projects/
   To ADD A POST:    create src/content/blog/, drop a .md file in
                     it, and restore the /blog page tree.
   Fill in the fields below at the top of each file (frontmatter).
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
  schema: z.object({
    title: z.string(),

    // One line under the title in the index.
    indexSummary: z.string(),

    // The paragraph in the record panel.
    description: z.string(),

    // Categories group the index, in the order set by src/i18n/register.js.
    category: z.enum(['Data', 'Map', 'Essay', 'Site', 'Tools']),

    // The ?p= value. Also the screenshot name.
    recordId: z.string().regex(/^[a-z0-9-]+$/),

    // The year of the current version.
    year: z.number().int(),

    // Up to five short words, lowercase.
    keywords: z.array(z.string()).max(5),

    // What the thing was actually made with. Omit when there is nothing
    // to list, which is what makes the field worth reading.
    builtWith: z.string().optional(),

    // Where the project lives. Omit while it is still an idea.
    url: z.string().url().optional(),

    // Path under public/. Omit for no screenshot.
    shot: z.string().optional(),

    // Omit when url already points at the repository.
    repository: z.string().url().optional(),

    // Data source credit, where a project names one.
    source: z.string().optional(),

    // Order within a category.
    order: z.number().default(99),

    lang: z.enum(['en']).default('en'),
  }),
});

export const collections = { blog, projects };
