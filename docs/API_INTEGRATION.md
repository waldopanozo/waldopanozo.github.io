# API integration

This frontend connects to `resume-api` and loads data at runtime.

## Endpoints

- `GET /resume` — profile, about, experience, skills, education, portfolio, contact, and social links.
- `GET /resume/dev-stats` — GitHub aggregated activity (commits, merged PRs, languages, per-user status).
  - Stats UI includes anonymized repo references (`top_repos_recent`) to avoid exposing full repository names/ownership details.
- `GET /resume/pdf` — download a generated resume adapted to the active `pid` variant.

Implementation lives in `assets/js/custom-v2.js`:

- `fetchResume()` hydrates all main sections.
- `fetchDevStats()` hydrates the **Developer Activity Stats** section.
- If `/resume` is temporarily unavailable, the site falls back to `assets/data/resume-fallback.json`.

## Variant flow (`pid`)

The frontend supports postulation variants through URL parameter `?pid=...`:

- Reads `pid` from URL on first load.
- Validates format as hex string (`16-64` chars, lowercase/uppercase accepted then normalized).
- Stores valid value in `sessionStorage` (`resume_pid`).
- Removes `pid` from URL using `history.replaceState` (clean shareable URL).
- Appends `pid` to API calls (`/resume` and `/resume/dev-stats`).

Behavior without variant in URL:

- Frontend sends no `pid` if `sessionStorage` is empty.
- Backend applies variant **`full`** (all experience, skills, portfolio; optional overrides only).
- Edit **`full`** in API Manage → Variants (listed first as *site root*).
- Tailored profiles still activate via `?pid=...` application links.

Visual indicator of active profile:

- Top gradient line changes with variant theme.
- Hero title highlight adapts to variant secondary color.
- Theme values are received from API in `_variant.theme`.

Download behavior:

- All resume download buttons (`hero`, `navbar`, `contact`) are wired to `/resume/pdf`.
- The active variant `pid` from session is automatically appended to the download URL.
- Result: downloaded PDF matches the currently active profile variant.

SEO behavior with variants:

- `pid` is intentionally removed from the visible URL after first load.
- Variant context is persisted in `sessionStorage`.
- `sitemap.xml` includes profile variant URLs (home + each `?pid=...`) for discovery and employer sharing.
- API mirror: `https://api.waldo.panozo.info/sitemap.xml` lists JSON, PDF, and dev-stats per variant.
- Regenerate after variant changes: `php scripts/generate_variant_sitemaps.php` in `resume-api` (see `docs/variant-links.md` there).
- Variants are not listed on the public site; only direct links with `?pid=...` activate them.

## Runtime configuration

Override endpoints without changing source by defining globals before loading `custom-v2.js`:

```html
<script>
  window.__RESUME_API_BASE_URL__ = 'https://api.waldo.panozo.info';
  window.__RESUME_FALLBACK_URL__ = 'assets/data/resume-fallback.json';
</script>
```
