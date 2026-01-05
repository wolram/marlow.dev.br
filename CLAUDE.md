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
