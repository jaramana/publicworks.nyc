---
title: "New York inequality, painted with A Coruña's colors"
indexSummary: "Comparing A Coruña and New York with the same Gini scale."
description: "How the comparison changes when New York’s income data is adjusted to match the Spanish measure."
pubDate: 2026-07-27
recordId: "gini"
author: "Cidade Labs"
lang: "en"
draft: false
kind: "research"
scope: "A Coruña / New York"
source: "INE · US Census Bureau"
repository: "https://github.com/cidade-labs/journal_gini-nyc"
---

This idea began as a question I'd been sitting on since I built the [ADRH Mapper](https://adrh.cidadelabs.org): **what would A Coruña's inequality map look like if you dropped it on New York?**

The Instituto Nacional de Estadística, Spain's agency responsible for collecting statistics, demographics, and the economy, publishes a Gini coefficient for every census section in the country. However, notable is that their income data is built from tax records. The US Census Bureau, the United States' equivalent, is tasked with similar responsibilities, but builds its number from a voluntary survey instead. Both countries hand you a number, they're sourced very differently.

## What a Gini coefficient is

If you line everyone up from poorest to richest, then track how much of the total income each slice of the population holds, that spread is the Gini coefficient. In a city where everyone earned the same, the poorest 30% would hold 30% of the income, and you would get a straight line.

The Gini is how far the real curve falls below that straight line. Zero means everyone earns the same, and one hundred means a single household holds everything. A Coruña scores 32 and New York scores 45.

<figure class="figure">
  <img src="/journal/gini/18_how_gini_works.png" alt="Lorenz curves for A Coruña and New York against a dashed diagonal representing perfect equality. New York's curve falls further below the diagonal than A Coruña's." loading="lazy" />
  <figcaption>Both cities against the same dashed line. New York's curve sags further, which is what a higher Gini means. Note that this measures how stretched incomes are, not how high they are, which matters later on.</figcaption>
</figure>

## Making the two similar

Spain measures income **after tax**, **adjusted for household size** (a couple isn't twice as rich as one person, rent doesn't double), counted **per person**, with the extreme ends trimmed. The American figure counts household income, before tax, with no adjustment and no trimming.

Every one of those four differences pushes New York's number up. So closing the gap meant rebuilding Spain's definition for New York from scratch, which meant writing a working model of the federal, state and city tax codes and running every household in New York through it.

This moves New York from **54.7 to 45.0**.

<figure class="figure">
  <img src="/journal/gini/16_what_changed.png" alt="Bar chart of the four adjustments that separate the Spanish Gini from the American one, sorted by size: taxes and benefits removes 5.8 points, counting people not households 1.6, ignoring the most extreme 3 percent 1.3, and adjusting for household size 0.9." loading="lazy" />
  <figcaption>Applied to the same New York data, the four adjustments move the city's Gini from 54.7 to 45.0. One of them does most of the work: 5.8 of the 9.7 points are tax alone.</figcaption>
</figure>

Tax is the big one, and it's the easiest to describe. For every household in the city, run its income through the tax code and see what's left:

<div class="formula">
  <p class="eq">net income = money income − income tax − payroll tax + refundable credits</p>
  <p class="note">Income tax means federal, New York State and New York City combined. Payroll tax is the share of Social Security and Medicare that comes out of a paycheck. Refundable credits are the earned income and child tax credits, which for low earners pay out more than the household owes.</p>
</div>

<figure class="figure">
  <img src="/journal/gini/17_tax_model.png" alt="Bar chart of effective tax rate by household income decile in New York, running from minus 7 percent for the poorest tenth to plus 37 percent for the richest." loading="lazy" />
  <figcaption>The poorest tenth of New York households gets back more than it pays. The richest tenth pays 37% of its income. Spain's number already has this done to it, and America's does not.</figcaption>
</figure>

## Capital gains

One notable difference in the US is that they don't account for "capital gains" the way Spain does.

The American Community Survey, the survey behind essentially every neighborhood income statistic in the United States, asks about wages, self-employment, interest, dividends, rent, Social Security, pensions and public assistance. It does not ask about capital gains. They're excluded from the Census Bureau's definition of "money income."

Which means the largest source of income at the very top of the American distribution
is missing from the statistic the US uses to measure its own inequality. ([CBO, 2022](https://www.cbo.gov/publication/62300))

The Internal Revenue Service, the United States' agency responsible for collecting federal taxes, knows precisely what capital gains were realized and by whom. That file simply never meets the survey at the US Census Bureau. Spain gets it in one annual number because the tax authority hands the INE the data.

Practical implication: every US figure below is a **floor**. Given how wealth actually works in the US, the real number should be higher.

## The end result

The original maps use different color ranges, so the same color does not represent the same Gini value in both cities.

The maps below apply each city's color breaks to the other city's data.

<figure class="figure gini-fig">
  <input type="radio" name="scale-nyc" id="scale-nyc-a" class="sa" checked />
  <input type="radio" name="scale-nyc" id="scale-nyc-b" class="sb" />
  <p class="figure-title">New York, read twice</p>
  <p class="figure-sub">The same 2,208 census tracts, on Spain's income concept. Only the class breaks change.</p>
  <div class="gini-tabs">
    <label for="scale-nyc-a" data-for="a">On A Coruña's scale</label>
    <label for="scale-nyc-b" data-for="b">On its own scale</label>
  </div>
  <div class="gini-body">
    <div class="gini-pane pane-a">
      <img src="/journal/gini/map-nyc-a.svg" alt="Map of New York's census tracts classified by A Coruña's Gini breaks. Almost the entire city is in the darkest class." loading="lazy" />
      <ul class="gini-legend">
        <li><i class="k1"></i>under 27.1</li>
        <li><i class="k2"></i>27.1–29.3</li>
        <li><i class="k3"></i>29.3–31.0</li>
        <li><i class="k4"></i>31.0–32.5</li>
        <li><i class="k5"></i>32.5 and over</li>
        <li><i class="k0"></i>no data</li>
      </ul>
    </div>
    <div class="gini-pane pane-b">
      <img src="/journal/gini/map-nyc-b.svg" alt="The same map of New York classified by its own Gini quintiles, showing detailed variation across the city." loading="lazy" />
      <ul class="gini-legend">
        <li><i class="k1"></i>under 31.4</li>
        <li><i class="k2"></i>31.4–34.7</li>
        <li><i class="k3"></i>34.7–37.7</li>
        <li><i class="k4"></i>37.7–41.4</li>
        <li><i class="k5"></i>41.4 and over</li>
        <li><i class="k0"></i>no data</li>
      </ul>
    </div>
  </div>
  <figcaption>Gini index by census tract, US Census Bureau, ACS 2019–2023, harmonized to the Spanish definition. Grey tracts are parks, airports and cemeteries, or too small to publish.</figcaption>
</figure>

On A Coruña's scale, the city is essentially one color. **Three quarters of New York's census tracts land in the top class**, the band A Coruña reserves for its most unequal fifth. Switch to its own scale and the detail comes back, from the same tracts carrying the same numbers.

Run it backwards and A Coruña goes almost entirely blue.

<figure class="figure gini-fig">
  <input type="radio" name="scale-cor" id="scale-cor-a" class="sa" checked />
  <input type="radio" name="scale-cor" id="scale-cor-b" class="sb" />
  <p class="figure-title">A Coruña, read twice</p>
  <p class="figure-sub">The same 186 census sections, the same values. Only the class breaks change.</p>
  <div class="gini-tabs">
    <label for="scale-cor-a" data-for="a">On its own scale</label>
    <label for="scale-cor-b" data-for="b">On New York's scale</label>
  </div>
  <div class="gini-body">
    <div class="gini-pane pane-a">
      <img src="/journal/gini/map-coruna-a.svg" alt="Map of A Coruña's census sections classified by its own Gini quintiles, showing a full range of colors across the city." loading="lazy" />
      <ul class="gini-legend">
        <li><i class="k1"></i>under 27.1</li>
        <li><i class="k2"></i>27.1–29.3</li>
        <li><i class="k3"></i>29.3–31.0</li>
        <li><i class="k4"></i>31.0–32.5</li>
        <li><i class="k5"></i>32.5 and over</li>
      </ul>
    </div>
    <div class="gini-pane pane-b">
      <img src="/journal/gini/map-coruna-b.svg" alt="The same map of A Coruña classified by New York's Gini breaks. Two thirds of the city falls into the single most equal class." loading="lazy" />
      <ul class="gini-legend">
        <li><i class="k1"></i>under 31.4</li>
        <li><i class="k2"></i>31.4–34.7</li>
        <li><i class="k3"></i>34.7–37.7</li>
        <li><i class="k4"></i>37.7–41.4</li>
        <li><i class="k5"></i>41.4 and over</li>
      </ul>
    </div>
  </div>
  <figcaption>Gini index by census section, INE, Atlas de Distribución de Renta de los Hogares, 2023. On New York's scale, two thirds of A Coruña collapses into the single most equal class.</figcaption>
</figure>

## Findings

Inequality piles up in the dense, old, mixed center. On both maps the red sits in the long-settled core and thins toward the edges, which is the same pattern in Galicia as in New York, at the same grain.

New York might reflect a greater trend of more extreme inequality in the United States. This trend is more obscure given that what's commonly known to be a source of wealth for the highest earners, capital gains, are not reflected in America's survey data.

High Gini values cover a much larger share of New York's census tracts than of A Coruña's.

<figure class="figure">
  <img src="/journal/gini/15_neighbourhood_comparison.png" alt="Dot chart placing A Coruña's ten census districts along the distribution of 196 New York neighborhood tabulation areas by median Gini." loading="lazy" />
  <figcaption>A Coruña's ten districts dropped into New York's spread of 196 neighborhood areas, which are close to A Coruña's districts in population. Only 9% of New York's neighborhoods are more equal than A Coruña's median district, but 34% are more equal than its most unequal one. The two cities overlap; they don't sit on top of each other.</figcaption>
</figure>

## Limitations

**Scale.** A Coruña has 245,000 people; New York has 8.8 million. Scale drives housing markets, segregation and social distance in ways no coefficient touches. My guess is Madrid and Barcelona would look more like New York here than like A Coruña, but that's a guess, and it isn't in this data.

**Capital Gains.** Until American capital gains reach neighborhood statistics, every US number here is a lower bound.

**Spread and Context.** Gini describes how stretched incomes are inside an area, and is entirely context dependent. Two neighborhoods, in different cities, can score identically and feel nothing alike.

**Welfare.** That framing is my own read, not something the numbers above measure. A Coruña's taxes fund childcare, university, healthcare, transit and a livable pension, and New York's taxes mostly don't buy the same things. If that's right, equal-looking incomes in the two cities aren't equal lives, and no amount of harmonizing fixes that.

---

*Spanish data: INE, Atlas de Distribución de Renta de los Hogares, 2023. American data: US Census Bureau, ACS 2019–2023 and PUMS microdata. Method, sources and the full list of caveats are documented alongside the code.*
