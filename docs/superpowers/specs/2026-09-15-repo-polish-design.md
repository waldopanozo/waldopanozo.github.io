# Spec: pulido del repositorio portfolio (About, README, OG, LICENSE)

**Fecha:** 2026-09-15  
**Repo:** `waldopanozo/waldopanozo.github.io`  
**Estado:** aprobado en conversación (enfoque Premium visual)

## Objetivo

Mejorar la ficha pública del repositorio en GitHub para que un recruiter o visitante entienda en segundos qué es el proyecto, cómo verlo en vivo y qué stack usa, sin ruido de worklog ni About vacío.

## Decisiones acordadas

| Tema | Decisión |
|------|----------|
| Alcance | Pack completo “premium visual” |
| Idioma del README público | Inglés |
| Licencia | All Rights Reserved (`LICENSE` en raíz) |
| OG / social preview | Imagen dedicada 1280×640 + meta en el sitio + preview del repo |
| Templates extra | No CONTRIBUTING / CoC / issue templates |

## Alcance

### Incluye

1. **GitHub About** (vía `gh repo edit`)
   - Description: `Personal CV & portfolio site — Senior Full-Stack (JS/TS, PHP, React). Live on GitHub Pages.`
   - Homepage: `https://waldopanozo.github.io`
   - Topics: `portfolio`, `cv`, `github-pages`, `resume`, `fullstack`, `javascript`, `php`, `react`
   - Desactivar Wiki y Projects; Issues puede permanecer activo

2. **README.md** (inglés, recruiter-first)
   - Título + badge al sitio live
   - Qué es (2–3 líneas)
   - Highlights (carousel, API/variants, developer stats, responsive)
   - Stack
   - Run locally
   - API integration (resumen corto)
   - License (enlace a `LICENSE`)
   - Sin Session Worklog en el README

3. **LICENSE**
   - All Rights Reserved: código visible como referencia; texto, fotos y PDF del CV no reutilizables sin permiso

4. **Social preview / Open Graph**
   - Generar `assets/img/og-cover.png` (1280×640) con nombre, rol *Senior Software Engineer*, URL del sitio y foto de perfil (`profile-blue.png` u otra foto de perfil existente)
   - Configurar social preview del repo en GitHub
   - Añadir en `index.html` meta `og:*` y `twitter:*` apuntando a la imagen canónica del sitio

5. **Docs**
   - `docs/SESSION_WORKLOG.md` ← worklog actual del README
   - `docs/API_INTEGRATION.md` ← detalle de API / `pid` / runtime config sacado del README

### Fuera de alcance

- CONTRIBUTING, CODE_OF_CONDUCT, issue/PR templates
- Refactors de frontend o cambios de UX del sitio (salvo meta OG)
- Commit/push del `sitemap.xml` local no relacionado (salvo que se pida aparte)

## Criterios de éxito

- La página del repo en GitHub muestra description, homepage y topics.
- El README cabe en una lectura rápida (~1–2 pantallas) y apunta al sitio live.
- Existe `LICENSE` coherente con la sección License del README.
- Al compartir la URL del sitio o del repo, la card muestra `og-cover.png` (o la preview configurada).
- El detalle técnico y el worklog viven en `docs/`, no en el README.

## Notas de implementación

- README y textos públicos orientados a recruiters: **inglés**.
- Documentación de diseño/spec en el workspace: **español** (esta carpeta).
- No subir `graphify-out/` ni otros artefactos locales.
- Generar la OG con herramientas locales (p. ej. Pillow); no depender de servicios externos.
- Tras implementar: commit/push solo si el usuario lo pide explícitamente; el About de GitHub se puede aplicar con `gh` en el mismo despliegue solicitado.
