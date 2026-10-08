---
title: "The Pay Gap"
indexSummary: "City pay and overtime by title and agency, fiscal 2014 to 2025."
description: "Explore New York City's published payroll by title or agency, from fiscal 2014 through 2025. Compare pay and overtime with New York inflation and rent."
category: "Data"
status: "works"
recordId: "thepaygap"
year: 2026
keywords: ["payroll", "open data", "r", "salaries"]
builtWith: "R, dplyr, Claude"
url: "https://paygap.publicworks.nyc"
cover: "../media/thepaygap.png"
repository: "https://github.com/jaramana/paygap.publicworks.nyc"
source: "NYC Citywide Payroll Data"
lead: "The Pay Gap brings New York City payroll into a search by title and agency, with overtime, tenure, inflation and rent comparisons."
specs:
  - label: "Data"
    value: "NYC Citywide Payroll Data, fiscal 2014–2025, BLS New York area prices and rent, Zillow Observed Rent Index, Social Security baby name records"
  - label: "Method"
    value: "Medians first. Groups under 30 people left empty. Pay adjusted with the average price index for the 12 months of each fiscal year."
  - label: "Built with"
    value: "R (data.table, dplyr, tidyr, jsonlite), HTML, CSS, JavaScript, Claude"
limit: "Gender is inferred from first names, tenure counts time at the current agency, and the data cannot say whether pay is fair."
updated: 2026-07-29
order: 3
lang: "en"
---

## Why it exists

The City publishes its entire payroll: every title, agency, base salary and overtime dollar, back to fiscal 2014. The raw file is hard to search by title or agency. The Pay Gap prepares it for those searches. There is no name search and no individual lookup.

## What it shows

Look up a title or an agency to see median and mean pay, overtime and tenure, and how pay has moved against New York prices and rent. Compare titles side by side, and set the minimum group size that suits the question.

A title is a legal category, with an examination attached and a negotiated rate. Most pay questions in City government are questions about a title, so the site is organized around them.

## How it is built

An R pipeline runs seven steps. It downloads the payroll and the New York area price and rent series, then compares first names with Social Security birth records to estimate gender. Salary figures count each employee with an annual salary and an active status on 30 June. Hourly and day-rate workers are calculated separately. Pay is adjusted with the average price index for the 12 months of each fiscal year, using the New York area series.

## Limits

The name proxy estimates the sex in a birth record. It cannot identify a transgender or non-binary person, and about one employee in ten has no usable match. Tenure is the time at the current agency. Required and voluntary overtime look the same. Every figure is gross pay. The site measures what the City pays, not what the work is worth.
