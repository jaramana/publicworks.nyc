# publicworks.nyc — Design and Development Brief

## Intent

`publicworks.nyc` is a minimal, functional index of projects spanning websites, data, and GIS.

It is not a personal homepage, résumé, biography, or consulting-company website. It should not explain who made the work. It exists primarily as a useful project folder for its owner and, secondarily, as something worth sharing with interested friends.

The site may eventually belong to a consulting company, but that possibility should remain entirely latent. Let the care, organization, and quality of the work imply seriousness.

## Character

The design should feel:

1. Minimalist
2. Functional
3. Subtly playful
4. Rooted in late-1990s and early-2000s web design
5. Touched by the uncanny fluidity of the AI era

The contemporary layer should not erase the older internet. It should occasionally distort, soften, or pass over it.

Avoid nostalgia as costume. Avoid generic “AI” imagery, elaborate branding, excessive interface chrome, and unnecessary explanation.

## Baseline

If built without AI assistance, the site might be:

- A white page
- Arial or a similar system typeface
- Black, bold project links
- A simple table or list
- One project per cell or row
- Possibly divided into a few thematic sections
- A restrained hover effect
- Almost no descriptive copy

You can see what I built in 2017 myself in "reference/index.html", for your awareness. This is an opportunity to really have fun.

Treat this as the site’s structural truth—not merely a fallback to decorate.

## Experience Model

Use the filing cabinet as an abstract interaction metaphor.

Opening the site reveals the tabs of every project, as though looking into an organized cabinet or index.

A visitor should be able to:

1. Scan the project tabs quickly.
2. Slightly “open” or inspect a project without leaving `publicworks.nyc`.
3. See only a small amount of material during inspection: perhaps a screenshot, year, type, keywords, or basic project data.
4. Activate the project to remove it from the cabinet and open the actual work.

Do not illustrate a literal filing cabinet. Express the metaphor through hierarchy, overlap, spacing, movement, occlusion, and disclosure.

## Page Structure

The preferred structure is:

- One view
- One page
- Vertical scrolling only
- No conventional multipage portfolio navigation
- No introductory biography
- No large explanatory hero section

The project index should begin immediately or nearly immediately.

Alternative structures may challenge these rules during concept exploration, but only when the alternative is materially stronger and remains simple, legible, and usable.

## Content

Keep content extremely restrained.

A project may contain:

- Title
- Destination URL
- Category
- Year
- A few keywords
- One small screenshot or preview
- Minimal technical metadata

Avoid:

- Project summaries
- Case studies
- Interpretive descriptions
- Marketing language
- Statements about impact
- Biographical content
- The creator’s name
- A conventional About section

The site should present the work without telling visitors what to think about it.

## Concept Exploration

Before implementing a final direction, present **three radically different structural concepts**.

Both concepts should preserve the project-index purpose and minimal content, but they should differ substantially in spatial logic, interaction, and treatment of the filing-system metaphor.

For each concept, provide:

- A short description
- A rough visual or working prototype
- How projects are scanned
- How a project is previewed
- How a project is opened
- Desktop and mobile behavior
- The principal usability risk
- Why the concept belongs specifically to `publicworks.nyc`

Do not proceed to full implementation until a direction is selected.

## Experimental Touchstones

Alongside the three structural concepts, present **three focused interaction or material studies**. These should be small enough to compare independently.

At minimum, explore:

### 1. Liquid functional layer

Investigate a restrained glass-like material for functional elements such as project tabs, filters, or the active preview.

It should contrast with the flat, imperfect order of the underlying index. Do not cover the entire site in glass.

### 2. Haze

Hovering or focusing a project link should produce a subtle haze, refraction, blur, displacement, or atmospheric disturbance.

The effect should feel slightly uncanny—as if an overly polished future interface is leaking into an older website.

It must:

- Remain brief and restrained
- Preserve text legibility
- Work without hover
- Respect reduced-motion and reduced-transparency preferences
- Never interfere with navigation

### 3. Wildcard

Propose one interaction not specified here.

It should strengthen the relationship between the orderly early web and the fluid AI-era layer. It should not add content, spectacle, or complexity merely for its own sake.

## Mobile Behavior

Mobile must feel intentionally designed.

Because hover does not exist on touch devices, provide a clear equivalent for previewing projects. Avoid creating a confusing interaction in which visitors cannot predict whether a tap previews or opens a project.

The project destination must always remain easy to reach.

## Accessibility

Target WCAG 2.2 AA.

At minimum:

- Use semantic HTML
- Support complete keyboard navigation
- Provide visible focus states
- Maintain sufficient contrast
- Avoid hover-only information
- Respect reduced-motion preferences
- Provide solid fallbacks for translucent effects
- Keep project destinations accessible without experimental effects
- Preserve usability at 200% text zoom

The minimal site should remain fully functional if its richer effects fail or are disabled.

## Technical Direction

The site will be hosted on GitHub Pages.

Prefer:

- Static HTML
- CSS
- Vanilla JavaScript
- Minimal dependencies
- No backend
- No required build pipeline unless it provides a clear benefit

A small experimental library is acceptable when it produces a compelling result that would be impractical to build directly. Any library should be documented, replaceable, and proportionate to its purpose.

## Manual Maintenance

The project list must be editable without AI assistance.

Keep all project records in one obvious location, using a small and documented structure. Adding a project should require changing only one file and adding any associated media.

The code should be readable by someone with basic HTML, CSS, JavaScript, and Bootstrap-level familiarity. Use clear names and comments where the implementation is not self-explanatory.

Do not hide fundamental behavior behind an elaborate framework or excessive abstraction.

## Final Deliverable

After a direction is selected, produce:

1. The complete static website
2. A single, clearly documented project-data source
3. Simple local-development instructions
4. GitHub Pages deployment instructions
5. Desktop and mobile screenshots
6. Keyboard and accessibility testing notes
7. A concise explanation of the selected structure
8. A list of deliberate compromises

The finished site should feel as immediate as a plain HTML index, as organized as a filing system, and as though something fluid and not entirely trustworthy is moving just beneath its surface.

