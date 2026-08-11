/* ---------------------------------------------------------------------------
   projects.js
   The single source of project data for publicworks.nyc.

   To add a project: copy a block, edit it, save. Nothing else to run.
   To remove a project: delete its block.
   To reorder: move the block.

   Projects are grouped into categories in the order the categories first
   appear in this file. Move a whole run of blocks to reorder the drawer.

   Fields
     id        short slug, lowercase, no spaces. Also the screenshot name.
     title     what the visitor reads
     url       where the project actually lives
     category  Data, Map, Essay, Analysis, Site, Tools
     year      four digits, as a number. The year of the current version.
     keywords  up to five short words, lowercase
     built     what the thing was actually made with, listed plainly, in the
               same house style the project READMEs already use. Claude is
               listed exactly like R or MapLibre, because it was a tool like
               R or MapLibre. Projects that predate it simply do not list it,
               which is what makes the field worth reading. null hides the row.
     shot      file in media/, or null for no screenshot
     source    optional repository link, shown as a small secondary link.
               Leave null when url already points at the repository.

   Screenshots live in media/ and are 720px wide PNGs. To make one:
     "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
       --headless=new --window-size=1200,900 --hide-scrollbars \
       --screenshot=media/NAME.png https://example.com
     sips -Z 720 media/NAME.png

   Headless Chrome cannot finish loading a WebGL map, so the three Coruña Labs
   map tools have no screenshot yet. They need capturing from a real browser.
--------------------------------------------------------------------------- */

const PROJECTS = [

  /* ---- Data ------------------------------------------------------------ */
  {
    id: "thepaygap",
    title: "thepaygap.nyc",
    url: "https://thepaygap.nyc",
    category: "Data",
    year: 2026,
    keywords: ["payroll", "open data", "r", "salaries"],
    built: "R, dplyr, Claude",
    shot: "media/thepaygap.png",
    source: "https://github.com/jaramana/thepaygap.nyc"
  },
  {
    id: "civilservice",
    title: "civilservice.nyc",
    url: "https://jaramana.github.io/civilservice.nyc/",
    category: "Data",
    year: 2026,
    keywords: ["exams", "job titles", "open data", "python"],
    built: "Python, JavaScript, Claude",
    shot: "media/civilservice.png",
    source: "https://github.com/jaramana/civilservice.nyc"
  },
  {
    id: "schoolsfinder",
    title: "schoolsfinder.nyc",
    url: "https://schoolsfinder.nyc",
    category: "Data",
    year: 2026,
    keywords: ["schools", "nycps", "python", "statistics"],
    built: "Python, Claude",
    shot: null,
    source: null
  },
  {
    /* The domain no longer resolves, so the repository is the destination. */
    id: "covidtracker",
    title: "covidtracker.nyc",
    url: "https://github.com/jaramana/covidtracker.nyc",
    category: "Data",
    year: 2020,
    keywords: ["covid", "dohmh", "charts", "archived"],
    built: "JavaScript, R",
    shot: null,
    source: null
  },

  /* ---- Map ------------------------------------------------------------- */
  {
    id: "staten-island",
    title: "Staten Island Data Viewer",
    url: "https://jaramana.github.io/staten-island-data-viewer/",
    category: "Map",
    year: 2026,
    keywords: ["3d", "maplibre", "open data", "buildings"],
    built: "Python, MapLibre, Claude",
    shot: "media/staten-island.png",
    source: "https://github.com/jaramana/staten-island-data-viewer"
  },
  {
    id: "busworks",
    title: "Bus Works",
    url: "https://busworks.corunalabs.org",
    category: "Map",
    year: 2026,
    keywords: ["buses", "gtfs", "a coruña", "maplibre"],
    built: "MapLibre, GTFS, Claude",
    shot: null,
    source: "https://github.com/Coruna-Labs/bus-works"
  },
  {
    id: "adrh",
    title: "ADRH Mapper",
    url: "https://adrh.corunalabs.org",
    category: "Map",
    year: 2026,
    keywords: ["income", "inequality", "ine", "a coruña"],
    built: "MapLibre, INE data, Claude",
    shot: null,
    source: "https://github.com/Coruna-Labs/adrh-mapper"
  },
  {
    id: "escolares",
    title: "Zonas Escolares",
    url: "https://escolares.corunalabs.org",
    category: "Map",
    year: 2026,
    keywords: ["schools", "catchments", "galiza", "xunta"],
    built: "MapLibre, Claude",
    shot: null,
    source: "https://github.com/Coruna-Labs/zonas-escolares"
  },
  {
    id: "hou-language",
    title: "Houston Language Explorer",
    url: "https://github.com/jaramana/hou-language-explorer",
    category: "Map",
    year: 2020,
    keywords: ["acs", "language", "leaflet", "houston"],
    built: "Leaflet, JavaScript",
    shot: null,
    source: null
  },
  {
    id: "nyc-commute",
    title: "NYC Commute",
    url: "https://github.com/jaramana/nyc-commute",
    category: "Map",
    year: 2020,
    keywords: ["commuting", "leaflet", "transit"],
    built: "Leaflet, JavaScript",
    shot: null,
    source: null
  },
  {
    id: "pr-popchange",
    title: "Puerto Rico Population Change",
    url: "https://github.com/jaramana/pr-popchange",
    category: "Map",
    year: 2020,
    keywords: ["census", "municipios", "leaflet"],
    built: "Leaflet, JavaScript",
    shot: null,
    source: null
  },

  /* ---- Essay ----------------------------------------------------------- */
  {
    id: "arabsincuba",
    title: "arabsincuba.com",
    url: "https://arabsincuba.com",
    category: "Essay",
    year: 2026,
    keywords: ["migration", "archive", "maps", "spanish"],
    built: "HTML, MapLibre, Claude",
    shot: "media/arabsincuba.png",
    source: "https://github.com/jaramana/arabsincuba.com"
  },
  {
    id: "galiciansincuba",
    title: "galiciansincuba.com",
    url: "https://galiciansincuba.com",
    category: "Essay",
    year: 2026,
    keywords: ["migration", "galiza", "schools", "galician"],
    built: "HTML, MapLibre, Claude",
    shot: "media/galiciansincuba.png",
    source: "https://github.com/jaramana/galiciansincuba.com"
  },

  /* ---- Analysis -------------------------------------------------------- */
  {
    id: "wav",
    title: "NYC WAV Wait Times",
    url: "https://github.com/jaramana/nyc-wav-wait-times",
    category: "Analysis",
    year: 2026,
    keywords: ["tlc", "accessibility", "r", "trip records"],
    built: "R, arrow, dplyr, Claude",
    shot: "media/wav.png",
    source: null
  },
  {
    id: "gini",
    title: "New York and A Coruña on one Gini scale",
    url: "https://github.com/Coruna-Labs/journal_gini-nyc",
    category: "Analysis",
    year: 2026,
    keywords: ["gini", "inequality", "census", "r"],
    built: null,
    shot: null,
    source: null
  },

  /* ---- Site ------------------------------------------------------------ */
  {
    id: "corunalabs",
    title: "Coruña Labs",
    url: "https://corunalabs.org",
    category: "Site",
    year: 2026,
    keywords: ["civic tech", "astro", "trilingual", "galiza"],
    built: "Astro, Claude",
    shot: "media/corunalabs.png",
    source: "https://github.com/Coruna-Labs/website"
  },
  {
    /* The title is the only place a name appears anywhere on the index, and it
       gets there by being a project rather than an author credit. Keywords
       stay about the object, not the person. */
    id: "allenshaibani",
    title: "allenshaibani.com",
    url: "https://allenshaibani.com",
    category: "Site",
    year: 2026,
    keywords: ["one page", "static", "css"],
    built: null,
    shot: "media/allenshaibani.png",
    source: "https://github.com/jaramana/allenshaibani.com"
  },

  /* ---- Tools ----------------------------------------------------------- */
  {
    id: "map-template",
    title: "Map Tool Template",
    url: "https://github.com/Coruna-Labs/map-template",
    category: "Tools",
    year: 2026,
    keywords: ["maplibre", "boilerplate", "static"],
    built: null,
    shot: null,
    source: null
  },
  {
    id: "geoclient",
    title: "Geoclient API R Puller",
    url: "https://github.com/jaramana/Geoclient-API-R-Puller",
    category: "Tools",
    year: 2022,
    keywords: ["geocoding", "r", "dcp", "api"],
    built: "R",
    shot: null,
    source: null
  },
  {
    id: "r-offer-lag",
    title: "R Offer Lag",
    url: "https://github.com/jaramana/R-Offer_Lag",
    category: "Tools",
    year: 2020,
    keywords: ["r", "hiring", "lag"],
    built: "R",
    shot: null,
    source: null
  },
  {
    id: "r-routing",
    title: "R Routing Distance",
    url: "https://github.com/jaramana/R-Routing_Distance",
    category: "Tools",
    year: 2019,
    keywords: ["r", "routing", "distance"],
    built: "R",
    shot: null,
    source: null
  },
  {
    id: "r-polygon-points",
    title: "R Polygon to Points",
    url: "https://github.com/jaramana/R-Polygon_to_Points",
    category: "Tools",
    year: 2019,
    keywords: ["r", "sf", "geometry"],
    built: "R",
    shot: null,
    source: null
  },
  {
    id: "r-pivot",
    title: "R Pivot Table",
    url: "https://github.com/jaramana/R-Pivot_Table",
    category: "Tools",
    year: 2019,
    keywords: ["r", "dplyr", "reshape"],
    built: "R",
    shot: null,
    source: null
  },
  {
    id: "arcpy-batch",
    title: "ArcPy Automated Batch Export",
    url: "https://github.com/jaramana/ArcPy_Automated-Batch-Export",
    category: "Tools",
    year: 2019,
    keywords: ["arcpy", "python", "export"],
    built: "Python, ArcPy",
    shot: null,
    source: null
  }
];
