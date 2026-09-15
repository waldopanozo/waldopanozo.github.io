# Waldo M. Panozo — Personal CV & Portfolio

[![Live site](https://img.shields.io/badge/live-waldopanozo.github.io-2563eb?style=flat-square)](https://waldopanozo.github.io)

Personal CV and portfolio site hosted on **GitHub Pages**. It presents my professional profile, achievements, experience, skills, education, and selected projects — with live data from a resume API and GitHub developer activity stats.

**Live:** https://waldopanozo.github.io

## Highlights

- **Resume-driven sections** — summary, achievements, experience timeline, skills, and education hydrated from the API (with local fallback).
- **Portfolio carousel** — featured projects with smooth scrolling and custom controls.
- **Developer activity stats** — commits trend, languages, merged PRs, and related GitHub signals.
- **Profile variants (`pid`)** — tailored resume views via `?pid=...` for applications (details in [docs/API_INTEGRATION.md](docs/API_INTEGRATION.md)).
- **Resume PDF download** — CTAs wired to the API so the PDF matches the active variant.

## Stack

- HTML5 + Bootstrap
- Custom CSS (`assets/css/style-v2.css`)
- JavaScript/jQuery (`assets/js/custom-v2.js`)
- GitHub Pages
- Resume API: `https://api.waldo.panozo.info`

## Run locally

```bash
git clone https://github.com/waldopanozo/waldopanozo.github.io.git
cd waldopanozo.github.io
python3 -m http.server 8080
# Open http://localhost:8080
```

## API integration (summary)

Runtime data comes from `resume-api`:

| Endpoint | Purpose |
|----------|---------|
| `GET /resume` | Profile and site sections |
| `GET /resume/dev-stats` | Aggregated GitHub activity |
| `GET /resume/pdf` | Variant-aware PDF download |

If the API is unavailable, the site falls back to `assets/data/resume-fallback.json`.

Full details (variants, SEO, runtime overrides): **[docs/API_INTEGRATION.md](docs/API_INTEGRATION.md)**.

Session / changelog notes: **[docs/SESSION_WORKLOG.md](docs/SESSION_WORKLOG.md)**.

## License

See [LICENSE](LICENSE). Code may be viewed for reference; personal content (copy, images, resume materials) is all rights reserved.
