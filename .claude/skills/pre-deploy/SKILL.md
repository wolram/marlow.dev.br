# Skill: pre-deploy

Executa validações completas antes do deploy para garantir qualidade de SEO e integridade do site.

## Invocação

Usuário ou Claude: `/pre-deploy`

## Processo de Validação

### 1. Mapear Todos os Arquivos HTML

Listar todos os arquivos `.html` no projeto:
- `index.html`
- `blog/index.html`
- `blog/*.html` (posts individuais)
- `nomad/index.html`
- `pt/index.html`
- `pt/blog/index.html`
- `pt/blog/*.html` (posts individuais)
- `pt/nomad/index.html`

**Excluir:** qualquer arquivo em `node_modules/`, `.git/`, etc.

### 2. Validação de Hreflang (CRÍTICA)

Para cada arquivo HTML, verificar:

**Páginas EN** devem ter estas 3 tags hreflang:
```html
<link rel="alternate" hreflang="en" href="https://marlow.dev.br/PATH">
<link rel="alternate" hreflang="pt-BR" href="https://marlow.dev.br/pt/PATH">
<link rel="alternate" hreflang="x-default" href="https://marlow.dev.br/PATH">
```

**Páginas PT** devem ter estas 3 tags hreflang:
```html
<link rel="alternate" hreflang="en" href="https://marlow.dev.br/PATH_SEM_PT">
<link rel="alternate" hreflang="pt-BR" href="https://marlow.dev.br/pt/PATH">
<link rel="alternate" hreflang="x-default" href="https://marlow.dev.br/PATH_SEM_PT">
```

**Verificar também:**
- URLs hreflang são absolutas (começam com `https://marlow.dev.br`)
- A contraparte referenciada existe no sistema de arquivos
- Não há typos nos valores de hreflang (`en`, `pt-BR`, `x-default`)

### 3. Validação de GA4

Para cada arquivo HTML, verificar presença de:
```html
gtag('config', 'G-M9WNCRDEXQ');
```

Reportar arquivos sem GA4 tracking.

### 4. Validação de sitemap.xml

Ler `/sitemap.xml` e verificar:
- XML sintaticamente válido
- Cada arquivo HTML encontrado no passo 1 tem URL correspondente no sitemap
- Cada URL no sitemap tem arquivo HTML correspondente no sistema de arquivos (sem órfãos)
- Datas `<lastmod>` no formato `YYYY-MM-DD`
- Valores `<priority>` entre 0.0 e 1.0

### 5. Paridade EN/PT de Blog

- Listar todos os slugs em `/blog/` (excluindo `index.html`)
- Listar todos os slugs em `/pt/blog/` (excluindo `index.html`)
- Verificar que todo post EN tem versão PT
- Verificar que todo post PT tem versão EN
- Comparar número de artigos em ambos os índices (cards em `articles-grid`)

### 6. Verificação de Links Internos

Para cada arquivo HTML:
- Extrair todos os `href` que começam com `/` ou são relativos (não `http://`, `mailto:`, `#`)
- Verificar se o arquivo alvo existe
- Reportar links quebrados com: arquivo de origem → link quebrado

### 7. Verificação de Meta Tags Essenciais

Para cada arquivo HTML, verificar presença de:
- `<title>` tag
- `<meta name="description">`
- `<link rel="canonical">`
- `<meta property="og:title">`
- `<meta property="og:description">`
- `<meta property="og:image">`

### 8. Gerar Relatório Final

```
Relatório de Validação Pré-Deploy
==================================
Data: {data_atual}

RESUMO
------
Total de arquivos HTML: {N}
Total de URLs no sitemap: {M}

RESULTADOS
----------

1. Hreflang
   ✓ ou ✗  {N}/{total} arquivos com hreflang correto
   Problemas:
   - /blog/arquivo.html: faltando hreflang pt-BR
   - /nomad/index.html: URL hreflang relativa (deve ser absoluta)

2. GA4 Tracking
   ✓ ou ✗  {N}/{total} arquivos com G-M9WNCRDEXQ
   Problemas: (lista se houver)

3. Sitemap
   ✓ ou ✗  XML válido
   ✓ ou ✗  Todas as {N} páginas incluídas
   Páginas faltando no sitemap: (lista)
   URLs órfãs no sitemap: (lista)

4. Paridade EN/PT
   ✓ ou ✗  {N} posts EN, {M} posts PT
   Posts sem versão PT: (lista)
   Posts sem versão EN: (lista)

5. Links Internos
   ✓ ou ✗  {N} links verificados, {M} quebrados
   Links quebrados: (lista arquivo → link)

6. Meta Tags
   ✓ ou ✗  {N}/{total} arquivos completos
   Problemas: (lista)

==================================
PROBLEMAS CRÍTICOS: {N}
PROBLEMAS MENORES: {M}

{Se N > 0}:
⚠️  CORREÇÃO NECESSÁRIA ANTES DO DEPLOY

Ações recomendadas:
- Hreflang faltando: executar /fix-hreflang
- Novo post sem sitemap: executar /new-blog-post ou atualizar manualmente
- Outros: corrigir manualmente e re-executar /pre-deploy

{Se N = 0}:
✅ SITE PRONTO PARA DEPLOY
Execute: ./deploy.sh
```

## Notas

- Executar a partir da raiz do projeto
- Deve ser executado antes de cada `./deploy.sh`
- Em caso de dúvida sobre um problema, reportar como aviso (não erro crítico)
- Priorizar hreflang e sitemap como críticos; meta tags como menores
