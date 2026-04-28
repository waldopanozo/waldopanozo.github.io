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

The integration is implemented in `assets/js/custom-v2.js`:

- `fetchResume()` hydrates all main sections.
- `fetchDevStats()` hydrates the new **Developer Activity Stats** section.
- If `/resume` is temporarily unavailable, the site falls back to `assets/data/resume-fallback.json`.

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

## License

All textual and visual content belongs to my personal CV. Feel free to review the code for reference or inspiration, but please avoid reusing the copy or images without permission.

