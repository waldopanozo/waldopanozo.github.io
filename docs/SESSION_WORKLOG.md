# Session worklog

Historical notes moved out of the root README for clarity.

## 2026-04-28

- Completed deep UI/UX and accessibility hardening:
  - heading order, icon link labels, touch targets, contrast, ARIA improvements, semantic landmarks.
  - added `robots.txt`, `sitemap.xml`, canonical and indexing metadata updates.
- Reworked developer stats visualizations:
  - language chart migrated to pie chart.
  - top repos list cleaned (no numbering, better labels).
  - unified commits trend normalized for better readability of low values.
  - conditional hiding of percentage labels in language legend for active variants.
- Implemented postulation variant flow in frontend:
  - read `pid` from query, validate as hexadecimal, persist in `sessionStorage`.
  - clean URL after capture (`history.replaceState`) while preserving active variant in session.
  - append `pid` to API calls for `/resume`, `/resume/dev-stats`, and `/resume/pdf`.
- Added variant-aware UI personalization:
  - theme color variables from API `_variant.theme`.
  - subtle top gradient indicator for active variant context.
- Added profile tech badges near hero photo using icon-font approach (non-SVG primary path).
- Profile variants are activated only via `?pid=...` links (for example from applications), not listed on the public site.

## 2026-09-15

- Default commits trend chart granularity set to weekly.
- Repository polish: GitHub About, recruiter-first README, LICENSE, OG cover, docs split.
