#!/usr/bin/env python3
"""
Validacao pre-deploy para marlow.dev.br
Verifica hreflang, sitemap, GA4, links internos e paridade EN/PT

Uso:
  python3 scripts/validate_deployment.py
  python3 scripts/validate_deployment.py --ci  # exit 1 se erros criticos
"""

import sys
import os
import re
import xml.etree.ElementTree as ET
from pathlib import Path
from html.parser import HTMLParser

ROOT = Path(__file__).parent.parent
GA4_ID = "G-M9WNCRDEXQ"
SITE_URL = "https://marlow.dev.br"
IGNORED_HTML_SEGMENTS = (
    "/node_modules/",
    "/.next/",
    "/out/",
    "/dist/",
)

# (en_file, pt_file, en_url, pt_url)
# Index pages use clean URLs (/), blog posts use .html
EXPECTED_PAIRS = [
    ("index.html",   "pt/index.html",   "/",          "/pt/"),
    ("blog/index.html",  "pt/blog/index.html",  "/blog/",     "/pt/blog/"),
    ("nomad/index.html", "pt/nomad/index.html", "/nomad/",    "/pt/nomad/"),
    ("blog/ai-agents-copilot-studio.html",    "pt/blog/ai-agents-copilot-studio.html",    "/blog/ai-agents-copilot-studio.html",    "/pt/blog/ai-agents-copilot-studio.html"),
    ("blog/bpmn-camunda-process-design.html", "pt/blog/bpmn-camunda-process-design.html", "/blog/bpmn-camunda-process-design.html", "/pt/blog/bpmn-camunda-process-design.html"),
    ("blog/uipath-optimization-playbook.html","pt/blog/uipath-optimization-playbook.html","/blog/uipath-optimization-playbook.html", "/pt/blog/uipath-optimization-playbook.html"),
    ("blog/building-the-future-program.html","pt/blog/building-the-future-program.html","/blog/building-the-future-program.html", "/pt/blog/building-the-future-program.html"),
]


class HreflangParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.hreflang_tags = []
        self.has_ga4 = False

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag == "link" and attrs_dict.get("rel") == "alternate":
            self.hreflang_tags.append({
                "hreflang": attrs_dict.get("hreflang", ""),
                "href": attrs_dict.get("href", ""),
            })


def parse_html(filepath):
    parser = HreflangParser()
    with open(filepath, encoding="utf-8") as f:
        content = f.read()
    parser.feed(content)
    if GA4_ID in content:
        parser.has_ga4 = True
    return parser


def validate_hreflang(errors, warnings):
    print("\n Validando hreflang...")
    for en_path, pt_path, en_slug, pt_slug in EXPECTED_PAIRS:
        en_url = f"{SITE_URL}{en_slug}"
        pt_url = f"{SITE_URL}{pt_slug}"
        for filepath in [ROOT / en_path, ROOT / pt_path]:
            if not filepath.exists():
                errors.append(f"Arquivo nao encontrado: {filepath.relative_to(ROOT)}")
                continue
            parser = parse_html(filepath)
            hrefs = {t["hreflang"]: t["href"] for t in parser.hreflang_tags}
            if "en" not in hrefs:
                errors.append(f"{filepath.relative_to(ROOT)}: faltando hreflang=en")
            elif hrefs["en"] != en_url:
                errors.append(f"{filepath.relative_to(ROOT)}: hreflang en incorreto (esperado: {en_url}, atual: {hrefs['en']})")
            if "pt-BR" not in hrefs:
                errors.append(f"{filepath.relative_to(ROOT)}: faltando hreflang=pt-BR")
            elif hrefs["pt-BR"] != pt_url:
                errors.append(f"{filepath.relative_to(ROOT)}: hreflang pt-BR incorreto (esperado: {pt_url}, atual: {hrefs['pt-BR']})")
            if "x-default" not in hrefs:
                warnings.append(f"{filepath.relative_to(ROOT)}: faltando hreflang=x-default")


def validate_sitemap(errors, warnings):
    print("\n Validando sitemap.xml...")
    sitemap_path = ROOT / "sitemap.xml"
    if not sitemap_path.exists():
        errors.append("sitemap.xml nao encontrado")
        return
    try:
        tree = ET.parse(sitemap_path)
        root = tree.getroot()
    except ET.ParseError as e:
        errors.append(f"sitemap.xml invalido: {e}")
        return
    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    urls = [loc.text for loc in root.findall(".//sm:loc", ns)]
    for en_path, pt_path, en_slug, pt_slug in EXPECTED_PAIRS:
        en_url = f"{SITE_URL}{en_slug}"
        pt_url = f"{SITE_URL}{pt_slug}"
        if en_url not in urls:
            errors.append(f"sitemap.xml: faltando {en_url}")
        if pt_url not in urls:
            errors.append(f"sitemap.xml: faltando {pt_url}")
    if len(urls) != len(set(urls)):
        errors.append("sitemap.xml: contem URLs duplicadas")
    print(f"   {len(urls)} URLs no sitemap")


def validate_ga4(errors, warnings):
    print("\n Validando GA4...")
    all_html = []
    for filepath in ROOT.glob("**/*.html"):
        path = str(filepath).replace("\\", "/")
        if "/scripts/" in path:
            continue
        if any(segment in path for segment in IGNORED_HTML_SEGMENTS):
            continue
        all_html.append(filepath)
    for filepath in all_html:
        parser = parse_html(filepath)
        if not parser.has_ga4:
            errors.append(f"{filepath.relative_to(ROOT)}: GA4 nao encontrado")


def validate_en_pt_parity(errors, warnings):
    print("\n Validando paridade EN/PT...")
    for en_path, pt_path, *_ in EXPECTED_PAIRS:
        en_file = ROOT / en_path
        pt_file = ROOT / pt_path
        if en_file.exists() and not pt_file.exists():
            errors.append(f"Faltando PT: {pt_path}")
        if pt_file.exists() and not en_file.exists():
            errors.append(f"Faltando EN: {en_path}")


def main():
    ci_mode = "--ci" in sys.argv
    errors = []
    warnings = []

    print("=" * 60)
    print("Validacao pre-deploy marlow.dev.br")
    print("=" * 60)

    validate_hreflang(errors, warnings)
    validate_sitemap(errors, warnings)
    validate_ga4(errors, warnings)
    validate_en_pt_parity(errors, warnings)

    print("\n" + "=" * 60)
    if warnings:
        print(f"\n {len(warnings)} aviso(s):")
        for w in warnings:
            print(f"   -> {w}")
    if errors:
        print(f"\n {len(errors)} erro(s) critico(s):")
        for e in errors:
            print(f"   -> {e}")
        if ci_mode:
            sys.exit(1)
    else:
        print("\n Todas as validacoes passaram!")
    return len(errors)


if __name__ == "__main__":
    sys.exit(main())
