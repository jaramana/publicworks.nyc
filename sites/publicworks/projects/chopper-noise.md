---
title: "Chopper Noise"
indexSummary: "Who hears helicopters over New York City and the Hudson waterfront."
description: "Recorded helicopter flights, certified noise levels and Census counts, combined to show which residents hear each flight and how many flights each block hears in a day. Three recorded days in August and September 2026."
category: "Map"
status: "works"
recordId: "choppernoise"
year: 2026
keywords: ["helicopters", "noise", "flights", "census", "python"]
builtWith: "Python, MapLibre, Claude"
url: "https://choppernoise.publicworks.nyc"
cover: "../media/choppernoise.png"
repository: "https://github.com/jaramana/choppernoise.publicworks.nyc"
source: "adsb.lol, U.S. Census Bureau, FAA, Iowa Environmental Mesonet, UK Civil Aviation Authority"
lead: "Chopper Noise counts the residents who hear each helicopter flight over New York City and the Hudson waterfront, and how many flights each block hears in a day."
specs:
  - label: "Data"
    value: "adsb.lol flight archive, 2020 Census blocks, FAA aircraft registry, LaGuardia air pressure from the Iowa Environmental Mesonet, UK CAA helicopter noise database"
  - label: "Days"
    value: "2 August, 15 August and 16 September 2026"
  - label: "Method"
    value: "Peak level at 150 m from each type's certified flyover level, less spherical spreading and 2 dB per km of air absorption, every 10 seconds along a flight"
  - label: "Built with"
    value: "Python standard library, MapLibre GL JS, OpenFreeMap tiles, Claude"
limit: "Levels are modeled outdoor peaks, not measurements. No measured flyover has checked them yet."
updated: 2026-10-05
order: 2
lang: "en"
---

## Why it exists

Helicopters fly low over New York City and the Hudson waterfront. Tours and charters share that air with police, medical and military flights. Chopper Noise counts the residents who hear each flight, and keeps non-essential and public-service flights apart.

## What it shows

The map replays three recorded days: Sunday 2 August, Saturday 15 August and Wednesday 16 September 2026. Replay plays a day at one minute every two seconds, with rings at 60, 70 and 80 dBA around each helicopter. Whole day colors each Census block by the loudest level it heard ten or more times.

Headline counts start at 60 dBA, about as loud as a conversation. Each 10 dB step sounds about twice as loud, so the rows read 2×, 4× and 8× as loud as 50 dBA, the level that marks a helicopter you can hear.

## How it is built

A Python pipeline, using only the standard library, reads the adsb.lol archives and keeps helicopters below 3,000 feet inside a box around the city. It checks every local hour for gaps, corrects altitudes with LaGuardia's air pressure, splits each aircraft's day into flights and sorts them into tours, charters, police, medical and military flights.

Each helicopter type gets a peak level at 150 metres from its certified flyover level. Every 10 seconds along a flight, the pipeline finds the level at each Census block within reach and counts the residents there. The browser repeats the same formula during Replay. No registration, owner or transponder address leaves the pipeline.

## Limits

The model ignores buildings, which block and reflect sound, and the way a helicopter is louder ahead of it than behind. Height is altitude above sea level, not above the ground. The three days are samples, not an average. Nassau and Westchester residents are not counted.
