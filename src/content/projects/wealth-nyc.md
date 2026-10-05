---
title: "Wealth NYC"
indexSummary: "Average household income by ZIP area, from IRS tax records and the Census Bureau."
description: "Two maps of average annual household income across 177 New York City ZIP areas, 2018 to 2022, one from IRS tax records and one from the Census Bureau's American Community Survey. Both use the same household counts and dollar scale, in 2022 dollars."
category: "Data"
status: "works"
recordId: "wealth"
year: 2026
keywords: ["income", "irs", "census", "zip codes", "python"]
builtWith: "Python, MapLibre, Claude, Codex"
url: "https://wealth.publicworks.nyc"
cover: "../../assets/media/wealth.png"
repository: "https://github.com/jaramana/wealth.publicworks.nyc"
source: "IRS Statistics of Income, Census Bureau ACS"
accent: "#579672"
lead: "Wealth NYC compares New York City income in tax records and in Census Bureau data, across 177 ZIP areas on one scale."
specs:
  - label: "Data"
    value: "IRS Statistics of Income by ZIP code, Census Bureau ACS 2018–2022 five-year estimates, BLS consumer price index, NYC Health ZIP area boundaries"
  - label: "Method"
    value: "Average annual income per household, 2018–2022, in 2022 dollars. Both sources divide by the same ACS household count."
  - label: "Built with"
    value: "Python (pandas, requests, Shapely), MapLibre GL JS, Claude, Codex"
limit: "These maps measure income, a flow of money. They do not measure net worth, and a few very large incomes can pull an area's average up."
updated: 2026-10-02
order: 1
lang: "en"
---

## Why it exists

New York's income peaks look more extreme through tax records. Tax records include reported capital gains, one part of income that the Census Bureau's household survey excludes. Wealth NYC puts the two accounts side by side, with the same household counts, years and dollar scale, so the difference shows.

## What it shows

Each of 177 ZIP areas rises as a stack. Taller stacks mean higher annual income per household, and colors brighten up to $1.2 million. Switch between the IRS and the Census Bureau to see the city by each account.

Select an area to see both estimates and the share of its IRS income that comes from interest, dividends and capital gains. Flat view reaches the areas hidden behind tall stacks. A table lists all 177 areas.

## How it is built

A Python pipeline joins the ZIP-area sources. For the tax view it adds adjusted gross income across each area's postal ZIPs for each year from 2018 to 2022, converts each year to 2022 dollars with the BLS consumer price index, averages the five years and divides by the area's ACS household count. The Census view divides ACS aggregate household income by the same household count.

NYC Health's modified ZIP Code Tabulation Areas set the 177 boundaries. This is an area-level join, not an address-level match. The map uses MapLibre GL JS.

## Limits

Net worth is assets minus debts, and the maps do not measure unsold gains or complete household wealth. Nonfilers fall outside the IRS totals, survey estimates have sampling error, and the two sources count income differently. IRS figures are withheld for areas with fewer than 1,000 returns in 2022.
