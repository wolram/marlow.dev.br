# Skill: new-blog-post

Cria um novo post de blog completo para marlow.dev.br, gerando ambas as versões (EN + PT) com todos os metadados, atualizando os índices de blog e o sitemap.

## Invocação

Apenas usuário: `/new-blog-post`

## Processo Completo

### Passo 1: Coletar Metadata

Solicite ao usuário (um de cada vez ou em bloco):

1. **slug** — identificador da URL, ex: `my-new-post` (sem espaços, lowercase, hífens)
2. **title_en** — título em inglês
3. **title_pt** — título em português
4. **description_en** — descrição SEO em inglês (máx 160 chars)
5. **description_pt** — descrição SEO em português (máx 160 chars)
6. **category** — uma de: `ai-agents`, `rpa`, `process-design`
7. **reading_time** — tempo de leitura em minutos (número inteiro)
8. **keywords_en** — palavras-chave em inglês, separadas por vírgula
9. **keywords_pt** — palavras-chave em português, separadas por vírgula
10. **pub_date** — data de publicação no formato `YYYY-MM-DD` (padrão: hoje)

### Passo 2: Gerar Arquivo EN

Criar `/blog/{slug}.html` com a seguinte estrutura completa:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-M9WNCRDEXQ"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-M9WNCRDEXQ');
  </script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title_en} | Marlow Sousa</title>

  <!-- SEO Meta Tags -->
  <meta name="description" content="{description_en}">
  <meta name="keywords" content="{keywords_en}">
  <meta name="author" content="Marlow Sousa">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://marlow.dev.br/blog/{slug}.html">

  <!-- Hreflang Tags -->
  <link rel="alternate" hreflang="en" href="https://marlow.dev.br/blog/{slug}.html">
  <link rel="alternate" hreflang="pt-BR" href="https://marlow.dev.br/pt/blog/{slug}.html">
  <link rel="alternate" hreflang="x-default" href="https://marlow.dev.br/blog/{slug}.html">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://marlow.dev.br/blog/{slug}.html">
  <meta property="og:title" content="{title_en}">
  <meta property="og:description" content="{description_en}">
  <meta property="og:image" content="https://marlow.dev.br/og-image.png">
  <meta property="og:locale" content="en_US">
  <meta property="og:site_name" content="Marlow Sousa Blog">
  <meta property="article:author" content="Marlow Sousa">
  <meta property="article:published_time" content="{pub_date}T00:00:00Z">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="https://marlow.dev.br/blog/{slug}.html">
  <meta name="twitter:title" content="{title_en}">
  <meta name="twitter:description" content="{description_en}">
  <meta name="twitter:image" content="https://marlow.dev.br/og-image.png">
  <meta name="twitter:creator" content="@marlowsousa">

  <!-- Theme Color -->
  <meta name="theme-color" content="#0a0a0a">

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='12' fill='%230a0a0a'/%3E%3Ctext x='50' y='68' font-family='system-ui,-apple-system,sans-serif' font-size='60' font-weight='800' fill='%23c8ff2d' text-anchor='middle'%3EM%3C/text%3E%3C/svg%3E">

  <!-- JSON-LD Article Schema -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "{title_en}",
    "description": "{description_en}",
    "image": "https://marlow.dev.br/og-image.png",
    "author": {
      "@type": "Person",
      "name": "Marlow Sousa",
      "url": "https://marlow.dev.br",
      "jobTitle": "RPA Tech Lead",
      "sameAs": ["https://linkedin.com/in/marlowsousa"]
    },
    "publisher": {
      "@type": "Person",
      "name": "Marlow Sousa",
      "url": "https://marlow.dev.br"
    },
    "datePublished": "{pub_date}T00:00:00Z",
    "dateModified": "{pub_date}T00:00:00Z",
    "url": "https://marlow.dev.br/blog/{slug}.html",
    "inLanguage": "en-US",
    "keywords": "{keywords_en}"
  }
  </script>

  <!-- Copiar CSS completo de /blog/ai-agents-copilot-studio.html -->
  <!-- [CSS OMITIDO AQUI POR BREVIDADE — COPIAR DO TEMPLATE] -->
</head>
<body>
  <!-- Custom cursor -->
  <div class="cursor"></div>
  <div class="cursor-follower"></div>

  <!-- Navigation -->
  <nav class="nav">
    <div class="nav-container">
      <a href="https://marlow.dev.br" class="nav-logo">Marlow.</a>
      <div class="nav-links">
        <a href="https://marlow.dev.br/blog/">Blog</a>
        <a href="https://marlow.dev.br/nomad/">Nomad</a>
        <a href="https://marlow.dev.br/#contact">Contact</a>
        <a href="https://marlow.dev.br/pt/blog/{slug}.html" class="lang-switch">PT</a>
      </div>
    </div>
  </nav>

  <!-- Article Header -->
  <header class="article-hero">
    <div class="container">
      <div class="article-meta">
        <a href="https://marlow.dev.br/blog/" class="back-link">← Back to Blog</a>
        <span class="article-category">{category_label_en}</span>
        <span class="reading-time">{reading_time} min read</span>
      </div>
      <h1 class="article-title">{title_en}</h1>
      <p class="article-subtitle">{description_en}</p>
      <div class="article-author">
        <span>By Marlow Sousa</span>
        <span>{pub_date_formatted_en}</span>
      </div>
    </div>
  </header>

  <!-- Article Content -->
  <main class="article-content">
    <div class="container">
      <article>

        <!-- TODO: Escrever conteúdo do artigo aqui -->
        <!-- Sugestão de estrutura: -->
        <h2>Introduction</h2>
        <p>[Introdução ao tema]</p>

        <h2>The Challenge</h2>
        <p>[Qual problema estamos resolvendo]</p>

        <h2>The Solution</h2>
        <p>[Como resolver]</p>

        <h2>Implementation</h2>
        <p>[Detalhes técnicos]</p>

        <h2>Results</h2>
        <p>[Métricas e resultados]</p>

        <h2>Conclusion</h2>
        <p>[Conclusão e próximos passos]</p>

      </article>
    </div>
  </main>

  <!-- Footer -->
  <footer class="footer">
    <div class="container">
      <p>© 2026 Marlow Sousa. Building automation that matters.</p>
      <div class="footer-links">
        <a href="https://marlow.dev.br">Home</a>
        <a href="https://marlow.dev.br/blog/">Blog</a>
        <a href="https://marlow.dev.br/#contact">Contact</a>
      </div>
    </div>
  </footer>

  <!-- Copiar JavaScript completo de /blog/ai-agents-copilot-studio.html -->
  <!-- [JS OMITIDO AQUI POR BREVIDADE — COPIAR DO TEMPLATE] -->
</body>
</html>
```

**IMPORTANTE:** Ao criar o arquivo real, copiar o CSS e JS completos de `/blog/ai-agents-copilot-studio.html`. Não usar os placeholders acima.

### Passo 3: Gerar Arquivo PT

Criar `/pt/blog/{slug}.html` com estrutura análoga:
- `lang="pt-BR"` no `<html>`
- `og:locale` = `pt_BR`
- `og:site_name` = "Blog Marlow Sousa"
- Todos os textos em português
- URLs de hreflang idênticas ao arquivo EN
- Links de navegação apontando para versões PT (`/pt/blog/`, `/pt/nomad/`, etc.)
- Link de switch de idioma aponta para EN: `/blog/{slug}.html`

### Passo 4: Atualizar `/blog/index.html`

Determinar o SVG icon correto pela categoria:

**ai-agents:**
```html
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 2a4 4 0 0 1 4 4v1a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"/>
  <path d="M16 7v1a4 4 0 0 1-8 0V7"/>
  <path d="M12 11v6"/>
  <path d="M8 17l4 4 4-4"/>
  <circle cx="12" cy="6" r="1"/>
  <path d="M6 12h2"/>
  <path d="M16 12h2"/>
</svg>
```

**rpa:**
```html
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 20V10"/>
  <path d="M18 20V4"/>
  <path d="M6 20v-4"/>
  <path d="M2 12l4-4 4 4"/>
  <path d="M18 8l4-4"/>
  <path d="M22 8V4h-4"/>
</svg>
```

**process-design:**
```html
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <rect x="3" y="3" width="6" height="6" rx="1"/>
  <rect x="15" y="3" width="6" height="6" rx="1"/>
  <rect x="9" y="15" width="6" height="6" rx="1"/>
  <path d="M6 9v3a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V9"/>
  <path d="M12 12v3"/>
</svg>
```

Inserir novo card **antes** do primeiro `<!-- Article` comment existente na seção `articles-grid`:

```html
      <!-- Article: {category_label_en} -->
      <a href="{slug}.html" class="article-card" data-category="{category}">
        <div class="article-card-image">
          <div class="article-card-icon">
            {SVG_ICON}
          </div>
        </div>
        <div class="article-card-content">
          <div class="article-card-meta">
            <span class="article-card-category">{category_label_en}</span>
            <span>{reading_time} min read</span>
          </div>
          <h3>{title_en}</h3>
          <p class="article-card-excerpt">
            {description_en}
          </p>
          <div class="article-card-footer">
            <span class="article-card-date">{pub_date_month_year_en}</span>
            <span class="article-card-read">
              Read More
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14"/>
                <path d="m12 5 7 7-7 7"/>
              </svg>
            </span>
          </div>
        </div>
      </a>
```

Também atualizar o array `blogPost` no JSON-LD do `/blog/index.html` adicionando:
```json
{
  "@type": "BlogPosting",
  "headline": "{title_en}",
  "url": "https://marlow.dev.br/blog/{slug}.html",
  "datePublished": "{pub_date}T00:00:00Z",
  "author": {"@type": "Person", "name": "Marlow Sousa"}
}
```

### Passo 5: Atualizar `/pt/blog/index.html`

Mesma lógica do Passo 4, mas com conteúdo em PT:
- Textos em português
- URLs sem `/pt/` prefix dentro do card
- Data formatada em PT (ex: "Janeiro 2026")
- "Ler Mais" em vez de "Read More"

### Passo 6: Atualizar `/sitemap.xml`

Adicionar 2 novas entradas:

```xml
  <url>
    <loc>https://marlow.dev.br/blog/{slug}.html</loc>
    <lastmod>{pub_date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://marlow.dev.br/pt/blog/{slug}.html</loc>
    <lastmod>{pub_date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
```

### Passo 7: Validar Outputs

Antes de reportar conclusão, verificar:
- [ ] Hreflang bidirecional: EN aponta para PT, PT aponta para EN
- [ ] URL canônica correta em cada arquivo
- [ ] JSON-LD com `datePublished` e `dateModified` corretos
- [ ] sitemap.xml continua sendo XML válido (sem erros de sintaxe)
- [ ] Cards adicionados em ambos os índices

### Passo 8: Reportar ao Usuário

Exibir resumo:

```
✅ Novo post de blog criado com sucesso!

Arquivos criados:
  + /blog/{slug}.html
  + /pt/blog/{slug}.html

Arquivos atualizados:
  ~ /blog/index.html (card adicionado + JSON-LD)
  ~ /pt/blog/index.html (card adicionado + JSON-LD)
  ~ /sitemap.xml (2 URLs adicionadas → total: N URLs)

Validações:
  ✓ Hreflang bidirecional (EN ↔ PT)
  ✓ GA4 tracking (G-M9WNCRDEXQ)
  ✓ JSON-LD Article schema
  ✓ sitemap.xml válido

Próximos passos:
  1. Escrever o conteúdo do artigo nos placeholders
  2. Executar /pre-deploy para validação final
  3. Usar ./deploy.sh para publicar
```

## Variáveis de Referência

| Variável | Descrição |
|---|---|
| `{slug}` | ex: `my-new-post` |
| `{title_en}` | Título completo em inglês |
| `{title_pt}` | Título completo em português |
| `{description_en}` | Descrição SEO inglês (≤160 chars) |
| `{description_pt}` | Descrição SEO português (≤160 chars) |
| `{category}` | `ai-agents` \| `rpa` \| `process-design` |
| `{category_label_en}` | `AI Agents` \| `RPA` \| `Process Design` |
| `{category_label_pt}` | `Agentes de IA` \| `RPA` \| `Design de Processos` |
| `{reading_time}` | Número inteiro de minutos |
| `{keywords_en}` | Lista separada por vírgula |
| `{keywords_pt}` | Lista separada por vírgula |
| `{pub_date}` | `YYYY-MM-DD` |
| `{pub_date_formatted_en}` | ex: `January 2026` |
| `{pub_date_formatted_pt}` | ex: `Janeiro 2026` |
