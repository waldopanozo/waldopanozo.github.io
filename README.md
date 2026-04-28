# Waldo M. Panozo – Personal CV Site

This repository hosts my personal CV site on GitHub Pages (`https://waldopanozo.github.io`). It showcases my professional profile, key achievements, skills, education, and selected projects in a modern, responsive layout.

## Highlights

- **Hero + detailed sections:** Up-to-date summary, achievements, experience timeline, skills, and education pulled directly from my resume.
- **Portfolio carousel:** Horizontal slider with smooth scrolling and custom controls for each featured project (React apps, APIs, etc.).
- **Blue-themed UI:** Translucent navigation bar, strong CTA buttons, and glassmorphism-inspired tiles.
- **Resume CTAs:** Download buttons in the hero, navbar, and contact area always point to the latest PDF.
- **Centralized contact:** Email, WhatsApp, availability, and social links presented as cards for quick access.

## Stack & Tooling

- HTML5 + Bootstrap
- Custom CSS (`assets/css/style-v2.css`)
- JavaScript/jQuery (`assets/js/custom-v2.js`) for smooth scrolling, animations, and carousel logic
- GitHub Pages for hosting
- Resume backend API (`https://api.waldo.panozo.info`)

## API integration

This frontend is connected to `resume-api` and loads data at runtime:

- `GET /resume` for profile, about, experience, skills, education, portfolio, contact, and social links.
- `GET /resume/dev-stats` for GitHub aggregated activity (commits, merged PRs, languages, per-user status).
- The stats UI includes anonymized repo references (`top_repos_recent`) to avoid exposing full repository names/ownership details.
- `GET /resume/pdf` to download a generated resume adapted to the active `pid` variant.

The integration is implemented in `assets/js/custom-v2.js`:

- `fetchResume()` hydrates all main sections.
- `fetchDevStats()` hydrates the new **Developer Activity Stats** section.
- If `/resume` is temporarily unavailable, the site falls back to `assets/data/resume-fallback.json`.

### Variant flow (`pid`)

The frontend supports postulation variants through URL parameter `?pid=...`:

- Reads `pid` from URL on first load.
- Validates format as hex string (`16-64` chars, lowercase/uppercase accepted then normalized).
- Stores valid value in `sessionStorage` (`resume_pid`).
- Removes `pid` from URL using `history.replaceState` (clean shareable URL).
- Appends `pid` to API calls (`/resume` and `/resume/dev-stats`).

Behavior without variant in URL:

- Frontend sends no `pid` if `sessionStorage` is empty.
- Backend default variant is applied (`demo-php-react`), so users still get a personalized baseline profile.

Visual indicator of active profile:

- Top gradient line changes with variant theme.
- Hero title highlight adapts to variant secondary color.
- Theme values are received from API in `_variant.theme`.

Download behavior:

- All resume download buttons (`hero`, `navbar`, `contact`) are wired to API endpoint `/resume/pdf`.
- The active variant `pid` from session is automatically appended to the download URL.
- Result: downloaded PDF matches the currently active profile variant.

SEO behavior with variants:

- `pid` is intentionally removed from the visible URL after first load.
- Variant context is persisted in `sessionStorage`.
- `sitemap.xml` includes profile variant URLs for crawler discovery.

### Runtime configuration

You can override endpoints without changing source code by defining globals before loading `custom-v2.js`:

```html
<script>
  window.__RESUME_API_BASE_URL__ = 'https://api.waldo.panozo.info';
  window.__RESUME_FALLBACK_URL__ = 'assets/data/resume-fallback.json';
</script>
```

## Run locally

```bash
git clone https://github.com/waldopanozo/waldopanozo.github.io.git
cd waldopanozo.github.io
python3 -m http.server 8080
# Open http://localhost:8080 in your browser
```

## Session Worklog

### 2026-04-28

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
- Added internal discoverability links for key profile tracks in footer.

## License

All textual and visual content belongs to my personal CV. Feel free to review the code for reference or inspiration, but please avoid reusing the copy or images without permission.

