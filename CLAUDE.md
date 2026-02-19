# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static HTML portfolio website for Marlow Sousa (RPA Tech Lead & Digital Nomad). No build tools, package managers, or frameworks - pure HTML5, CSS3, and vanilla JavaScript.

**Live Site:** https://marlow.dev.br

## Development

```bash
# Preview locally - just open HTML files in browser
open index.html

# Deploy to production - push to master triggers GitHub Actions
git push origin master
```

No build process. Edit HTML files directly, preview in browser, push to deploy.

## Project Structure

```
.
├── index.html              # Main portfolio (English)
├── pt/index.html           # Portuguese version
├── blog/                   # Blog articles (English)
├── pt/blog/                # Blog articles (Portuguese)
├── nomad/                  # Digital nomad page
├── pt/nomad/               # Portuguese nomad page
├── assets/                 # Favicon, icons
├── sitemap.xml             # XML sitemap (12 URLs)
└── robots.txt
```

12 total pages: 6 English (root), 6 Portuguese (/pt/).

## Architecture

- **CSS:** Embedded in `<style>` tags, uses CSS variables for theming (dark theme, `--accent: #c8ff2d`)
- **JavaScript:** Vanilla JS at bottom of each HTML file (custom cursor, scroll animations, IntersectionObserver, parallax)
- **Fonts:** Google Fonts (Syne for headlines, JetBrains Mono for body)
- **Analytics:** GA4 on all pages (ID: `G-M9WNCRDEXQ`)
- **i18n:** English/Portuguese with hreflang tags for SEO

## Key Patterns

When adding content:
- Maintain both English and Portuguese versions
- Include GA4 script, meta tags, OpenGraph, and JSON-LD schema
- Update `sitemap.xml` when adding/removing pages
- Keep hreflang tags in sync between language versions

## Deployment & CI/CD (GitHub Actions)

### Automated Workflows

| Workflow | Trigger | Purpose |
|---|---|---|
| `deploy.yml` | Push to `master` | Auto-deploy to Hostinger via rsync |
| `validate-pr.yml` | PR opened/updated | Run pre-deploy checks, comment results |
| `create-blog-post.yml` | Issue labeled `blog-post` | Generate EN+PT HTML, open PR |

### Required GitHub Secrets

Configure at: Settings → Secrets and variables → Actions

| Secret | Value |
|---|---|
| `SSH_PRIVATE_KEY` | Private SSH key for Hostinger |
| `SSH_HOST` | Server IP |
| `SSH_PORT` | `65002` |
| `SSH_USER` | SSH username |
| `SSH_PATH` | `~/domains/marlow.dev.br/public_html/` |

### Blog Post via Issue Workflow

1. Create GitHub Issue using "Novo Blog Post" template
2. Add label `blog-post`
3. GitHub Action auto-generates EN+PT HTML and opens PR
4. Review PR → merge → auto-deploy

### Scripts

- `scripts/validate_deployment.py` — validate hreflang, sitemap, GA4, EN/PT parity
- `scripts/generate_blog_post.py` — generate blog post from issue body Markdown

### Claude Code Skills (local)

| Skill | Purpose |
|---|---|
| `/new-blog-post` | Interactive blog post generation (local) |
| `/pre-deploy` | Run pre-deploy validations locally |

### Hreflang Status

All 12 pages have correct bidirectional hreflang tags:
- EN pages: `hreflang="en"` + `hreflang="pt-BR"` + `hreflang="x-default"`
- PT pages: `hreflang="en"` + `hreflang="pt-BR"` + `hreflang="x-default"`
- Index pages use clean URLs (`/`, `/pt/`, `/blog/`, etc.)
- Blog posts use `.html` extension (`/blog/slug.html`)
