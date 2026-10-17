---
title: "Cable Turf"
indexSummary: "Why most New Yorkers can't choose their cable company, block by block."
description: "The FCC's broadband records on the City's cable franchise map, told as a five-step story that ends in a map of every Census block. Each block shows the cable company that claims it and whether any other wired option is claimed. Home service only, from the FCC's December 2025 New York files."
category: "Map"
status: "works"
recordId: "cableturf"
year: 2026
keywords: ["internet", "cable", "broadband", "fcc", "python"]
builtWith: "Python, MapLibre, Claude"
url: "https://cableturf.publicworks.nyc"
cover: "../media/cableturf.png"
focus: { x: 85, y: 52, zoom: 2.4 }
closeUp: "../media/close/cableturf.png"
repository: "https://github.com/jaramana/cableturf.publicworks.nyc"
source: "Federal Communications Commission, NYC Planning, NYC Office of Technology and Innovation"
lead: "Cable Turf puts the FCC's broadband records on the City's cable franchise map, as a short story that ends in a map of every block."
take: ""
specs:
  - label: "Data"
    value: "FCC Broadband Data Collection fixed availability files for New York, December 2025, updated 13 October 2026; NYC Planning 2020 Census blocks and Neighborhood Tabulation Areas; OTI cable franchise areas, 2016"
  - label: "Method"
    value: "Each block takes the cable company that claims home service there. Verizon fiber and Astound count as another wired option; wireless never does. Counts are FCC locations, which are buildings."
  - label: "Built with"
    value: "Python standard library, MapLibre GL JS, OpenFreeMap tiles, Claude"
limit: "Figures are the companies' own claims, counted by building, not by home. The franchise map dates from 2016."
updated: 2026-10-17
order: 9
draft: false
lang: "en"
---
