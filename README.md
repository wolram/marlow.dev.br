# marlow.dev.br

![Version](https://img.shields.io/badge/version-1.0.1-c8ff2d)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

Personal portfolio website for **Marlow Sousa** — Software Engineering Lead & Digital Nomad.

**Live:** [marlow.dev.br](https://marlow.dev.br)

## Stack

Pure static site — no build tools, no frameworks, no package managers.

- **HTML5** — semantic markup, JSON-LD structured data, Open Graph & Twitter Cards
- **CSS3** — embedded `<style>` per page, CSS variables, dark theme (`#0a0a0a` + `#c8ff2d`)
- **Vanilla JS** — custom cursor, scroll animations, IntersectionObserver, parallax
- **Fonts** — Syne (headlines) + JetBrains Mono (body)
- **i18n** — English (root) + Portuguese (`/pt/`), bidirectional hreflang tags
- **Analytics** — Google Analytics 4

## Structure

```
├── index.html              # EN homepage
├── pt/index.html           # PT homepage
├── blog/                   # EN blog posts
├── pt/blog/                # PT blog posts
├── nomad/                  # EN digital nomad page
├── pt/nomad/               # PT digital nomad page
├── assets/                 # Images & favicons
├── scripts/                # Blog generation & validation tools
│   ├── generate_blog_post.py
│   ├── validate_deployment.py
│   └── templates/          # Jinja2 blog post templates
├── sitemap.xml
├── robots.txt
└── site.webmanifest
```

## Development

```bash
# Preview — just open in browser
open index.html

# Validate before deploy
python3 scripts/validate_deployment.py

# Deploy — push to master triggers GitHub Actions
git push origin master
```

## Branch Policy

- Este repositório usa `master` como branch principal de produção.
- Prefixos recomendados para branches de trabalho: `feat/*`, `fix/*`, `chore/*`.
- Prefixos recomendados para commits: `feat:`, `fix:`, `chore:`, `docs:`.

## Contributing

Contributions are welcome via [GitHub Issues](https://github.com/marlowsb/marlow.dev.br/issues):

- **Bug reports** — broken links, display issues, typos
- **Blog posts** — use the "Novo Blog Post" issue template to propose content
- **Newsletter editions** — use the "Nova Newsletter" issue template for newsletter pipeline cards
- **Suggestions** — ideas for new sections or improvements

## License

All rights reserved. This is a personal portfolio — code is public for reference but not licensed for reuse.
