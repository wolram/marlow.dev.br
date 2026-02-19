#!/usr/bin/env python3
"""
Validação pré-deploy para marlow.dev.br
Verifica hreflang, sitemap, GA4, links internos e paridade EN/PT

Uso:
  python3 scripts/validate_deployment.py         # validar tudo
  python3 scripts/validate_deployment.py --ci    # formato CI (exit 1 se houver erros críticos)
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

# Pares EN/PT esperados
EXPECTED_PAIRS = [
    ("index.html", "pt/index.html"),
    ("blog/index.html", "pt/blog/index.html"),
    ("nomad/index.html", "pt/nomad/index.html"),
    ("blog/ai-agents-copilot-studio.html", "pt/blog/ai-agents-copilot-studio.html"),
    ("blog/bpmn-camunda-process-design.html", "pt/blog/bpmn-camunda-process-design.html"),
    ("blog/uipath-optimization-playbook.html", "pt/blog/uipath-optimization-playbook.html"),
]


class HreflangParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.hreflang_tags = []
        self.has_ga4 = False
        self.title = ""
        self._in_title = False

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag == "link" and attrs_dict.get("rel") == "alternate":
            self.hreflang_tags.append({
                "hreflang": attrs_dict.get("hreflang", ""),
                "href": attrs_dict.get("href", ""),
            })
        if tag == "script":
            src = attrs_dict.get("src", "")
            if GA4_ID in src:
                self.has_ga4 = True
        if tag == "title":
            self._in_title = True

    def handle_data(self, data):
        if self._in_title:
            self.title += data

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False


def parse_html(filepath):
    parser = HreflangParser()
    with open(filepath, encoding="utf-8") as f:
        content = f.read()
    parser.feed(content)
    # GA4 pode estar inline também
    if GA4_ID in content:
        parser.has_ga4 = True
    return parser


def validate_hreflang(errors, warnings):
    """Valida hreflang bidirecional em todos os arquivos HTML."""
    print("\n📋 Validando hreflang...")
    all_html = list(ROOT.glob("**/*.html"))
    # Excluir arquivos de scripts
    all_html = [f for f in all_html if "scripts" not in str(f)]

    for en_path, pt_path in EXPECTED_PAIRS:
        en_file = ROOT / en_path
        pt_file = ROOT / pt_path

        for filepath, expected_en, expected_pt in [
            (en_file, en_path, pt_path),
            (pt_file, en_path, pt_path),
        ]:
            if not filepath.exists():
                errors.append(f"Arquivo não encontrado: {filepath.relative_to(ROOT)}")
                continue

            parser = parse_html(filepath)
            hrefs = {t["hreflang"]: t["href"] for t in parser.hreflang_tags}

            en_url = f"{SITE_URL}/{expected_en}"
            pt_url = f"{SITE_URL}/{expected_pt}"

            if "en" not in hrefs:
                errors.append(f"{filepath.relative_to(ROOT)}: faltando hreflang='en'")
            elif hrefs["en"] != en_url:
                errors.append(f"{filepath.relative_to(ROOT)}: hreflang='en' aponta para {hrefs['en']}, esperado {en_url}")

            if "pt-BR" not in hrefs:
                errors.append(f"{filepath.relative_to(ROOT)}: faltando hreflang='pt-BR'")
            elif hrefs["pt-BR"] != pt_url:
                errors.append(f"{filepath.relative_to(ROOT)}: hreflang='pt-BR' aponta para {hrefs['pt-BR']}, esperado {pt_url}")

            if "x-default" not in hrefs:
                warnings.append(f"{filepath.relative_to(ROOT)}: faltando hreflang='x-default' (recomendado)")


def validate_sitemap(errors, warnings):
    """Valida sintaxe e completude do sitemap.xml."""
    print("\n🗺️  Validando sitemap.xml...")
    sitemap_path = ROOT / "sitemap.xml"

    if not sitemap_path.exists():
        errors.append("sitemap.xml não encontrado")
        return

    try:
        tree = ET.parse(sitemap_path)
        root = tree.getroot()
    except ET.ParseError as e:
        errors.append(f"sitemap.xml inválido: {e}")
        return

    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    urls = [loc.text for loc in root.findall(".//sm:loc", ns)]

    # Verificar se todos os pares esperados estão no sitemap
    for en_path, pt_path in EXPECTED_PAIRS:
        en_url = f"{SITE_URL}/{en_path}"
        pt_url = f"{SITE_URL}/{pt_path}"

        if en_url not in urls:
            errors.append(f"sitemap.xml: faltando URL {en_url}")
        if pt_url not in urls:
            errors.append(f"sitemap.xml: faltando URL {pt_url}")

    # Verificar URLs duplicadas
    if len(urls) != len(set(urls)):
        errors.append("sitemap.xml: contém URLs duplicadas")

    print(f"   {len(urls)} URLs encontradas no sitemap")


def validate_ga4(errors, warnings):
    """Verifica se GA4 está presente em todas as páginas."""
    print("\n📊 Validando GA4...")
    all_html = list(ROOT.glob("**/*.html"))
    all_html = [f for f in all_html if "scripts" not in str(f)]

    for filepath in all_html:
        parser = parse_html(filepath)
        if not parser.has_ga4:
            errors.append(f"{filepath.relative_to(ROOT)}: GA4 ({GA4_ID}) não encontrado")


def validate_en_pt_parity(errors, warnings):
    """Verifica se todos os arquivos EN têm contraparte PT."""
    print("\n🌐 Validando paridade EN/PT...")
    for en_path, pt_path in EXPECTED_PAIRS:
        en_file = ROOT / en_path
        pt_file = ROOT / pt_path

        if en_file.exists() and not pt_file.exists():
            errors.append(f"Arquivo PT não encontrado: {pt_path} (par de {en_path})")
        if pt_file.exists() and not en_file.exists():
            errors.append(f"Arquivo EN não encontrado: {en_path} (par de {pt_path})")


def validate_internal_links(errors, warnings):
    """Verifica links internos quebrados."""
    print("\n🔗 Validando links internos...")
    all_html = list(ROOT.glob("**/*.html"))
    all_html = [f for f in all_html if "scripts" not in str(f)]
    broken = 0

    href_pattern = re.compile(r'href=["\'](?!https?://|mailto:|#)([^"\']+)["\']')

    for filepath in all_html:
        with open(filepath, encoding="utf-8") as f:
            content = f.read()

        for match in href_pattern.finditer(content):
            link = match.group(1)
            # Ignorar anchors e links especiais
            if link.startswith("#") or link.startswith("tel:") or link.startswith("javascript:"):
                continue

            # Resolver path relativo
            target = (filepath.parent / link).resolve()
            # Se termina com /, procurar index.html
            if link.endswith("/"):
                target = target / "index.html"

            if not target.exists() and not target.is_dir():
                warnings.append(f"{filepath.relative_to(ROOT)}: link interno possível quebrado: {link}")
                broken += 1

    if broken == 0:
        print("   Nenhum link interno quebrado encontrado")


def main():
    ci_mode = "--ci" in sys.argv
    errors = []
    warnings = []

    print("=" * 60)
    print("🔍 Validação pré-deploy marlow.dev.br")
    print("=" * 60)

    validate_hreflang(errors, warnings)
    validate_sitemap(errors, warnings)
    validate_ga4(errors, warnings)
    validate_en_pt_parity(errors, warnings)
    validate_internal_links(errors, warnings)

    print("\n" + "=" * 60)
    print("📊 Resultado da Validação")
    print("=" * 60)

    if warnings:
        print(f"\n⚠️  {len(warnings)} aviso(s):")
        for w in warnings:
            print(f"   → {w}")

    if errors:
        print(f"\n❌ {len(errors)} erro(s) crítico(s):")
        for e in errors:
            print(f"   → {e}")
        print("\nCorrigir os erros antes de fazer deploy.")
        if ci_mode:
            sys.exit(1)
    else:
        print("\n✅ Todas as validações passaram! Pronto para deploy.")

    return len(errors)


if __name__ == "__main__":
    sys.exit(main())
