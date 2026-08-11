# publicworks.nyc: selected direction

**C, the drawer.** Two levels: a category tab stands at the left margin, the
projects filed under it sit indented behind. Exactly one card is held out at a
time. No wordmark, no instructions, no explanation.

[Open it](../index.html). The two extremes kept for reference are
[maximal](c-max.html) and [zen](c-zen.html); the
superseded structures are [A](a-tabs.html) and
[B](b-ledger.html).

## Decisions made

**The indent carries meaning now.** It was `nth-child(4n)`, which was decoration,
so it went. Two levels only: category, then the projects under it. This also
removed the filter pills, because the categories are the filter.

**Nothing is captioned.** The hint line is gone. Every behaviour below is
discoverable by trying it and invisible otherwise.

**No sign on the cabinet.** There is a visually hidden `<h1>` for screen readers
and search engines, and nothing on screen.

## What is in the index

Twenty-four projects across six categories, drawn from the `jaramana` and
`Coruna-Labs` GitHub accounts and the local project folders. All of it is in
[projects.js](../projects.js), one block per project. Eight have screenshots in
`media/`; the rest render a dashed placeholder.

| Category | Count |
| --- | --- |
| Data | 4 |
| Map | 7 |
| Essay | 2 |
| Analysis | 2 |
| Site | 2 |
| Tools | 7 |

**allenshaibani.com is in, on purpose.** The brief rules out biographical
content and an author credit, and this does neither. It is a project in the
index like any other, and the name arrives sideways, as a domain someone can
choose to click. It is the only place a name appears anywhere on the site. Its
keywords describe the object rather than the person for the same reason.

**schoolsfinder.nyc is in ahead of its deploy.** The record points at
`https://schoolsfinder.nyc`, which does not resolve yet. That link is dead
until the repository is pushed, Pages is switched on and the domain is pointed.

Still left out, and yours to overrule:

1. **urban-risk-index**, a fork of `NYCEM-GIS/urban-risk-index`. Given the work
   at NYC Emergency Management this may well be yours in substance, in which
   case it belongs in Analysis.
2. **ahmadshaibani.com, Language-Explorer, Leaflet-Demo, test, mc_server**, as
   duplicates, demos or not projects.

One standing decision: **years are the year of the current version, not first
commit.** thepaygap.nyc reads 2026, not 2020.

## The behaviours nobody is told about

| Try | What happens |
| --- | --- |
| Arrow keys, or `j` and `k` | Walk the whole drawer, across category boundaries |
| Type a few letters | Jumps to that project. `wav` lands on NYC WAV Wait Times. Buffer clears after 800ms |
| `Enter` | Opens the held project |
| Shift-click a tab, or Shift-Enter | Opens the repository instead of the site |
| Type `1999` | The stylesheet switches off for five seconds. Times New Roman, blue underlined links, a bare `<ul>`. Any key or click returns early |

Idle drift was built and then cut before launch. Leaving the page alone for 90
seconds used to fade the card out and release the selected tab, with any
movement reopening it. It is in the history if it is ever wanted back.
| Find the bottle | 11 by 22 pixels, on the rail spine below the last tab, at zero opacity. Clicking it is after five |

### The bottle

It is not drawn at all until a cursor comes to rest on it, and the reveal is
delayed 550ms so that sweeping past shows nothing. It is not in the tab order
and not in the accessibility tree, so there is no route to it except a cursor
happening to stop on an eleven pixel wide patch of blank margin.

Once a minute it gives itself away. It fades up over 1.2 seconds to 17%
opacity, holds for a moment, and is gone again by three seconds, then nothing
for the next fifty-seven. Enough to catch out of the corner of an eye, not
enough to read as a control. Both numbers are `--tell-every` and `--tell-peak`
at the top of the file. The fade survives `prefers-reduced-motion` on purpose:
it is opacity only, no movement, and it is the single hint anyone gets.

Once the party is on it stays visible, because it is also the way back out.

### After five

The office party, laid over the same drawer. The structure does not move: every
tab is where it was and the card holds the same record. What changes is the
lighting and what has been hung off it.

The palette is the City flag: blue, white, orange. The same three the Mets and
the Knicks wear. It is the only place on the site that admits where any of this
is from.

Deep blue dusk with a warm glow off the right edge, string lights blinking down
the rail spine in orange, white, and blue, a paper hat on every category tab,
blue-white-orange tinsel swaying across the top of the card, the selected tab in
Mets orange, ninety pieces of confetti, and every tab tilted very slightly. The
tilt is derived from the project id, so a given tab always leans the same way.

It persists in `localStorage` under `publicworks.afterfive`, so it survives a
reload until you click the bottle again. Under `prefers-reduced-motion` the
colours stay and the confetti, blinking, and swaying all stop.

Two build notes. The party card is solid rather than a 7% tint over
`backdrop-filter`; the tint rendered inconsistently against a dark page and the
record has to stay readable at a party. And the year on the selected orange tab
is dark navy, not the blue used on every other tab, which failed contrast
against orange.

## Accessibility

Semantic HTML, real links to real destinations, visible focus rings, full
keyboard operation, no hover-only information. `prefers-reduced-motion` and
`prefers-reduced-transparency` are both honoured, including inside the party.
Turn off CSS and JavaScript and every project is still reachable, which is what
`1999` demonstrates on purpose.

The keyboard focus ring is inset (`outline-offset: -2px`) rather than floating
outside the tab. It is still 2px at full contrast, which WCAG 2.2 asks for, but
it hugs the tab and inherits its corner instead of stacking a second, larger
rounded box on top of a tab that is already clearly marked as selected. In the
party the ring turns white, or navy on the orange tab, because black on navy is
not a focus indicator.

The keyboard behaviours listen on the document rather than the rail, so they
work from a cold page load with nothing focused. Bound to the rail, they did
nothing until you first clicked or tabbed into a tab, which is the bug you hit.

Not yet tested: 200% text zoom, VoiceOver, and WCAG 2.2's 24px minimum touch
target. The tabs are comfortably above it. The bottle is 11 by 22 and is
deliberately unreachable by keyboard or screen reader, which is the point of it
but is a decision rather than an oversight.

## Next

1. Decide the three open data questions above.
2. Point `index.html` at this and set up the GitHub Pages deploy with a CNAME.
3. Run the three untested accessibility checks.
