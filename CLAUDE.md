# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static HTML portfolio website for Marlow Sousa (Software Engineering Lead & Digital Nomad). No build tools, package managers, or frameworks — pure HTML5, CSS3, and vanilla JavaScript.

**Live Site:** https://marlow.dev.br

## Development Commands

```bash
# Preview locally — just open HTML files in browser
open index.html

# Run pre-deploy validation
python3 scripts/validate_deployment.py        # interactive
python3 scripts/validate_deployment.py --ci   # exit 1 on errors (used in CI)

# Generate blog post from issue JSON (or test data)
python3 scripts/generate_blog_post.py --test          # example post
python3 scripts/generate_blog_post.py --issue-file x  # from issue JSON
python3 scripts/generate_blog_post.py --dry-run       # preview without writing

# Deploy — push to master triggers GitHub Actions (no manual deploy needed)
git push origin master
```

Python scripts require: `pip install -r requirements.txt` (beautifulsoup4, lxml, markdown, jinja2).

## Architecture

- **No build step.** Edit HTML files directly, preview in browser, push to deploy.
- **CSS:** Embedded `<style>` tags per page. CSS variables for dark theme (`--bg-primary: #0a0a0a`, `--accent: #c8ff2d`). Fonts: Syne (headlines), JetBrains Mono (body).
- **JavaScript:** Vanilla JS at bottom of each HTML file (custom cursor, scroll animations, IntersectionObserver, parallax).
- **i18n:** 12 total pages — 6 English (root), 6 Portuguese (`/pt/`). All pages have bidirectional hreflang tags.
- **Analytics:** GA4 on all pages (ID: `G-M9WNCRDEXQ`).

### URL Conventions

- Index pages use clean URLs: `/`, `/pt/`, `/blog/`, `/pt/blog/`, `/nomad/`, `/pt/nomad/`
- Blog posts use `.html` extension: `/blog/slug.html`, `/pt/blog/slug.html`
- `hreflang="x-default"` always points to the EN version

### Blog Post Generation

Two paths to create blog posts:

1. **GitHub Issues workflow:** Create issue with "Novo Blog Post" template + label `blog-post` → Actions runs `scripts/generate_blog_post.py` → opens PR with EN+PT HTML + sitemap update
2. **Local skill:** `/new-blog-post` — interactive metadata collection, generates both HTML files, updates blog indices and sitemap

Blog posts use Jinja2 templates in `scripts/templates/` (`blog_post_en.html.j2`, `blog_post_pt.html.j2`, `blog_post_styles.css`). The template CSS is embedded inline in generated posts.

## Key Patterns

When adding or modifying content:
- **Always maintain both EN and PT versions** with matching slugs
- Include GA4 script, meta tags (description, OG, Twitter Card), JSON-LD schema, and hreflang tags
- Update `sitemap.xml` when adding/removing pages
- Keep hreflang tags in sync between language versions
- Use existing blog posts (e.g., `blog/ai-agents-copilot-studio.html`) as reference for CSS/JS patterns when creating content manually

## CI/CD (GitHub Actions)

| Workflow | Trigger | Purpose |
|---|---|---|
| `deploy.yml` | Push to `master` | rsync to Hostinger, fix permissions, smoke test |
| `validate-pr.yml` | PR to `master` | Run `validate_deployment.py --ci`, comment results on PR |
| `create-blog-post.yml` | Issue labeled `blog-post` | Generate EN+PT HTML via Jinja2 templates, open PR |

### Required GitHub Secrets

| Secret | Purpose |
|---|---|
| `SSH_PRIVATE_KEY` | Private SSH key for Hostinger |
| `SSH_HOST` | Server IP |
| `SSH_PORT` | `65002` |
| `SSH_USER` | SSH username |
| `SSH_PATH` | `~/domains/marlow.dev.br/public_html/` |

### What Gets Deployed

`deploy.yml` uses `rsync --delete` and excludes: `.git/`, `.github/`, `.claude/`, `scripts/`, `*.pdf`, `deploy.sh*`, `.gitignore`, `GEMINI.md`, `CLAUDE.md`, `requirements.txt`, `.DS_Store`.

## Validation Script

`scripts/validate_deployment.py` checks:
- **Hreflang:** bidirectional EN↔PT tags on all page pairs
- **Sitemap:** XML validity, all pages present, no orphan URLs
- **GA4:** tracking code on every HTML file
- **EN/PT parity:** every EN page has a PT counterpart and vice versa

The script uses a hardcoded `EXPECTED_PAIRS` list — update it when adding new pages.

## Claude Code Skills

| Skill | Invocation | Purpose |
|---|---|---|
| `/new-blog-post` | User only | Interactive blog post generation (EN+PT + indices + sitemap) |
| `/pre-deploy` | User or Claude | Run full pre-deploy validation checklist |
| `/fix-hreflang` | User only | One-time fix for missing hreflang tags (may already be resolved) |
