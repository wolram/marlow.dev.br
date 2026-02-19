#!/usr/bin/env python3
"""
Gerador de blog posts para marlow.dev.br

Converte um issue GitHub (ou dados de CLI) em arquivos HTML EN+PT,
atualiza os índices de blog e sitemap.xml.

Uso local:
  python3 scripts/generate_blog_post.py --issue-file /path/to/issue.json
  python3 scripts/generate_blog_post.py --test  # Gera post de exemplo

Em GitHub Actions (GITHUB_EVENT_PATH é definido automaticamente):
  python3 scripts/generate_blog_post.py
"""

import sys
import os
import re
import json
import argparse
import markdown as md_lib
from pathlib import Path
from datetime import date, datetime
from jinja2 import Environment, FileSystemLoader

ROOT = Path(__file__).parent.parent
SCRIPTS = Path(__file__).parent
TEMPLATES_DIR = SCRIPTS / "templates"
BLOG_EN = ROOT / "blog"
BLOG_PT = ROOT / "pt" / "blog"
SITEMAP = ROOT / "sitemap.xml"
SITE_URL = "https://marlow.dev.br"

CATEGORY_MAP = {
    "ai-agents": ("AI & Automation", "IA & Automação"),
    "rpa": ("RPA", "RPA"),
    "process-design": ("Process Design", "Design de Processos"),
    "nomad": ("Digital Nomad", "Nômade Digital"),
    "tech": ("Technology", "Tecnologia"),
}

MONTHS_EN = {
    1: "January", 2: "February", 3: "March", 4: "April",
    5: "May", 6: "June", 7: "July", 8: "August",
    9: "September", 10: "October", 11: "November", 12: "December"
}

MONTHS_PT = {
    1: "Janeiro", 2: "Fevereiro", 3: "Março", 4: "Abril",
    5: "Maio", 6: "Junho", 7: "Julho", 8: "Agosto",
    9: "Setembro", 10: "Outubro", 11: "Novembro", 12: "Dezembro"
}


def parse_issue_body(body: str) -> dict:
    """
    Extrai metadata e conteúdo do corpo do issue GitHub.
    Formato esperado: seções ## com labels específicos.
    """
    data = {}

    def extract_section(label: str) -> str:
        pattern = rf"## {re.escape(label)}\s*\n(.*?)(?=\n## |\Z)"
        match = re.search(pattern, body, re.DOTALL | re.IGNORECASE)
        return match.group(1).strip() if match else ""

    def extract_meta(key: str) -> str:
        pattern = rf"\*\*{re.escape(key)}:\*\*\s*(.+)"
        match = re.search(pattern, body)
        return match.group(1).strip() if match else ""

    # Metadata
    data["slug"] = extract_meta("Slug").lower().replace(" ", "-")
    data["category"] = extract_meta("Categoria").lower()
    data["read_time"] = extract_meta("Tempo de leitura").replace(" minutos", "").replace(" min", "").strip() or "10"
    data["keywords_en"] = extract_meta("Keywords EN")
    data["keywords_pt"] = extract_meta("Keywords PT")

    # Títulos (plain + accent)
    title_en_raw = extract_section("Título EN") or extract_section("Título")
    title_pt_raw = extract_section("Título PT")

    # Suporte a **negrito** como accent: "Título **Accent**"
    accent_match_en = re.search(r"\*\*(.+?)\*\*", title_en_raw)
    if accent_match_en:
        data["title_en_accent"] = accent_match_en.group(1)
        data["title_en_plain"] = re.sub(r"\*\*(.+?)\*\*", "", title_en_raw).strip()
    else:
        words = title_en_raw.split()
        data["title_en_plain"] = " ".join(words[:-1]) if len(words) > 1 else title_en_raw
        data["title_en_accent"] = words[-1] if len(words) > 1 else ""

    accent_match_pt = re.search(r"\*\*(.+?)\*\*", title_pt_raw)
    if accent_match_pt:
        data["title_pt_accent"] = accent_match_pt.group(1)
        data["title_pt_plain"] = re.sub(r"\*\*(.+?)\*\*", "", title_pt_raw).strip()
    else:
        words = title_pt_raw.split()
        data["title_pt_plain"] = " ".join(words[:-1]) if len(words) > 1 else title_pt_raw
        data["title_pt_accent"] = words[-1] if len(words) > 1 else ""

    data["title_en"] = f"{data['title_en_plain']} {data['title_en_accent']}".strip()
    data["title_pt"] = f"{data['title_pt_plain']} {data['title_pt_accent']}".strip()

    # Subtítulos e descrições
    data["subtitle_en"] = extract_section("Subtítulo EN") or extract_section("Subtitle EN")
    data["subtitle_pt"] = extract_section("Subtítulo PT") or extract_section("Subtitle PT")
    data["description_en"] = extract_section("Descrição EN") or extract_section("Description EN") or data["subtitle_en"][:160]
    data["description_pt"] = extract_section("Descrição PT") or extract_section("Description PT") or data["subtitle_pt"][:160]

    # Conteúdo Markdown
    data["content_en_md"] = extract_section("Conteúdo EN") or extract_section("Content EN")
    data["content_pt_md"] = extract_section("Conteúdo PT") or extract_section("Content PT")

    return data


def markdown_to_html(text: str) -> str:
    """Converte Markdown para HTML com extensões úteis."""
    return md_lib.markdown(
        text,
        extensions=["extra", "nl2br", "sane_lists"],
    )


def format_date_en(d: date) -> str:
    return f"{MONTHS_EN[d.month]} {d.day}, {d.year}"


def format_date_pt(d: date) -> str:
    return f"{d.day} de {MONTHS_PT[d.month]} de {d.year}"


def get_css() -> str:
    css_file = TEMPLATES_DIR / "blog_post_styles.css"
    if css_file.exists():
        return css_file.read_text()
    return ""


def render_post(data: dict, today: date) -> tuple[str, str]:
    """Renderiza os templates EN e PT com os dados fornecidos."""
    env = Environment(
        loader=FileSystemLoader(str(TEMPLATES_DIR)),
        autoescape=True,
    )

    cat_en, cat_pt = CATEGORY_MAP.get(data["category"], ("Technology", "Tecnologia"))
    keywords_list_en = [k.strip() for k in data["keywords_en"].split(",") if k.strip()]
    keywords_list_pt = [k.strip() for k in data["keywords_pt"].split(",") if k.strip()]

    context = {
        "slug": data["slug"],
        "date": today.isoformat(),
        "date_formatted_en": format_date_en(today),
        "date_formatted_pt": format_date_pt(today),
        "year": today.year,
        "category": cat_en,
        "category_pt": cat_pt,
        "read_time": data["read_time"],
        "keywords_en": data["keywords_en"],
        "keywords_pt": data["keywords_pt"],
        "keywords_list_en": keywords_list_en,
        "keywords_list_pt": keywords_list_pt,
        "title_en": data["title_en"],
        "title_en_plain": data["title_en_plain"],
        "title_en_accent": data["title_en_accent"],
        "title_pt": data["title_pt"],
        "title_pt_plain": data["title_pt_plain"],
        "title_pt_accent": data["title_pt_accent"],
        "subtitle_en": data["subtitle_en"],
        "subtitle_pt": data["subtitle_pt"],
        "description_en": data["description_en"],
        "description_pt": data["description_pt"],
        "content_en": markdown_to_html(data["content_en_md"]),
        "content_pt": markdown_to_html(data["content_pt_md"]),
        "related_posts_en": [
            {
                "url": "https://marlow.dev.br/blog/index.html",
                "tag": "Blog",
                "title": "More Articles",
                "description": "Explore more automation and tech content.",
            }
        ],
        "related_posts_pt": [
            {
                "url": "https://marlow.dev.br/pt/blog/index.html",
                "tag": "Blog",
                "title": "Mais Artigos",
                "description": "Explore mais conteúdo de automação e tecnologia.",
            }
        ],
        "css": get_css(),
    }

    html_en = env.get_template("blog_post_en.html.j2").render(**context)
    html_pt = env.get_template("blog_post_pt.html.j2").render(**context)
    return html_en, html_pt


def update_sitemap(slug: str, today: date):
    """Adiciona as novas URLs ao sitemap.xml se não existirem."""
    if not SITEMAP.exists():
        print("sitemap.xml não encontrado, pulando.")
        return

    content = SITEMAP.read_text()
    en_url = f"{SITE_URL}/blog/{slug}.html"
    pt_url = f"{SITE_URL}/pt/blog/{slug}.html"
    today_str = today.isoformat()

    new_entries = []
    if en_url not in content:
        new_entries.append(
            f"  <url>\n    <loc>{en_url}</loc>\n    <lastmod>{today_str}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>"
        )
    if pt_url not in content:
        new_entries.append(
            f"  <url>\n    <loc>{pt_url}</loc>\n    <lastmod>{today_str}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>"
        )

    if new_entries:
        content = content.replace("</urlset>", "\n" + "\n".join(new_entries) + "\n</urlset>")
        SITEMAP.write_text(content)
        print(f"sitemap.xml atualizado com {len(new_entries)} nova(s) URL(s)")


def get_test_data() -> dict:
    """Dados de exemplo para teste local."""
    return {
        "slug": "test-ci-cd-post",
        "category": "tech",
        "read_time": "5",
        "keywords_en": "CI/CD, GitHub Actions, Automation, Static Site",
        "keywords_pt": "CI/CD, GitHub Actions, Automação, Site Estático",
        "title_en": "Automating Blog Posts with **GitHub Actions**",
        "title_en_plain": "Automating Blog Posts with",
        "title_en_accent": "GitHub Actions",
        "title_pt": "Automatizando Posts com **GitHub Actions**",
        "title_pt_plain": "Automatizando Posts com",
        "title_pt_accent": "GitHub Actions",
        "subtitle_en": "How I automated the entire blog post creation workflow using GitHub Issues and Actions.",
        "subtitle_pt": "Como automatizei todo o fluxo de criação de posts usando GitHub Issues e Actions.",
        "description_en": "Learn how to create a complete CI/CD pipeline for a static blog using GitHub Actions.",
        "description_pt": "Aprenda a criar um pipeline CI/CD completo para um blog estático usando GitHub Actions.",
        "content_en_md": "## Introduction\n\nThis is a test post generated by the CI/CD pipeline.\n\n## How it Works\n\n1. Create a GitHub Issue\n2. GitHub Actions parses the issue\n3. HTML files are generated automatically\n4. A PR is opened for review\n5. After merge, auto-deploy fires\n\n## Conclusion\n\nAutomation saves time and reduces errors.",
        "content_pt_md": "## Introdução\n\nEste é um post de teste gerado pelo pipeline CI/CD.\n\n## Como Funciona\n\n1. Crie um GitHub Issue\n2. GitHub Actions analisa o issue\n3. Arquivos HTML são gerados automaticamente\n4. Um PR é aberto para revisão\n5. Após merge, o deploy automático executa\n\n## Conclusão\n\nAutomação economiza tempo e reduz erros.",
    }


def main():
    parser = argparse.ArgumentParser(description="Gera blog posts para marlow.dev.br")
    parser.add_argument("--issue-file", help="Path para arquivo JSON do issue GitHub")
    parser.add_argument("--test", action="store_true", help="Gera post de exemplo")
    parser.add_argument("--dry-run", action="store_true", help="Não escreve arquivos")
    args = parser.parse_args()

    today = date.today()

    if args.test:
        data = get_test_data()
    else:
        # Tentar ler do GITHUB_EVENT_PATH (GitHub Actions)
        event_path = args.issue_file or os.environ.get("GITHUB_EVENT_PATH")
        if not event_path or not Path(event_path).exists():
            print("Erro: forneça --issue-file ou defina GITHUB_EVENT_PATH")
            sys.exit(1)

        with open(event_path) as f:
            event = json.load(f)

        issue = event.get("issue", {})
        body = issue.get("body", "")
        if not body:
            print("Erro: corpo do issue está vazio")
            sys.exit(1)

        data = parse_issue_body(body)

    if not data.get("slug"):
        print("Erro: slug não encontrado no issue")
        sys.exit(1)

    print(f"Gerando post: {data['slug']}")
    print(f"Título EN: {data['title_en']}")
    print(f"Título PT: {data['title_pt']}")

    html_en, html_pt = render_post(data, today)

    en_path = BLOG_EN / f"{data['slug']}.html"
    pt_path = BLOG_PT / f"{data['slug']}.html"

    if args.dry_run:
        print(f"\n[DRY RUN] Escreveria: {en_path}")
        print(f"[DRY RUN] Escreveria: {pt_path}")
    else:
        en_path.write_text(html_en, encoding="utf-8")
        pt_path.write_text(html_pt, encoding="utf-8")
        print(f"Criado: {en_path}")
        print(f"Criado: {pt_path}")
        update_sitemap(data["slug"], today)

    # Exportar slug para GitHub Actions
    github_output = os.environ.get("GITHUB_OUTPUT")
    if github_output:
        with open(github_output, "a") as f:
            f.write(f"slug={data['slug']}\n")
            f.write(f"title_en={data['title_en']}\n")

    print("\nPost gerado com sucesso!")


if __name__ == "__main__":
    main()
