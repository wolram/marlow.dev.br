# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static HTML portfolio website for Marlow Sousa (RPA Tech Lead & Digital Nomad). No build tools, package managers, or frameworks - pure HTML5, CSS3, and vanilla JavaScript.

**Live Site:** https://marlow.dev.br

## Development

```bash
# Preview locally - just open HTML files in browser
open index.html

# Deploy to production (Hostinger via rsync/SSH)
./deploy.sh
```

No build process. Edit HTML files directly, preview in browser, deploy when ready.

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
├── deploy.sh               # Deployment script
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

## Deployment

`deploy.sh` uses rsync over SSH (port 65002) to Hostinger. Excludes `.git`, `.DS_Store`, `.pdf`, `deploy.sh`, `.claude/`. Sets permissions after upload.

## Claude Code Automations

### Skills (User-invocable commands)

| Skill | Purpose | Time Saved |
|---|---|---|
| `/new-blog-post` | Generate complete EN+PT blog post with all metadata | 54 min/post |
| `/pre-deploy` | Validate hreflang, sitemap, links before deploying | 10-15 min/deploy |
| `/fix-hreflang` | One-time fix for missing hreflang on EN pages (already applied) | — |

**Workflow for new blog posts:**
1. `/new-blog-post` → answer 10 prompts → files generated automatically
2. Write content in the placeholders
3. `/pre-deploy` → validate everything
4. `./deploy.sh` → publish

### Hooks (Automatic validations)

- **PostToolUse:** Reminds about sitemap and `/pre-deploy` after editing blog files
- **PreToolUse:** Warns when editing critical files (`sitemap.xml`, `deploy.sh`, `robots.txt`)

### Hreflang Status

All 12 pages now have correct bidirectional hreflang tags:
- EN pages: `hreflang="en"` + `hreflang="pt-BR"` + `hreflang="x-default"`
- PT pages: `hreflang="en"` + `hreflang="pt-BR"` + `hreflang="x-default"`
