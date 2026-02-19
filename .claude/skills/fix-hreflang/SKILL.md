# Skill: fix-hreflang

Corrige automaticamente o problema de hreflang faltante nas páginas em inglês do marlow.dev.br.

**⚠️ USO ÚNICO:** Esta skill resolve um problema pré-existente. Após execução bem-sucedida, pode ser deletada.

## Invocação

Apenas usuário: `/fix-hreflang`

## Contexto do Problema

As páginas em inglês NÃO têm tags hreflang, mas as versões PT têm.
Isso causa penalidades de SEO por conteúdo duplicado sem sinalização de idioma.

**Páginas afetadas (inglês):**
- `/index.html`
- `/blog/index.html`
- `/blog/ai-agents-copilot-studio.html`
- `/blog/uipath-optimization-playbook.html`
- `/blog/bpmn-camunda-process-design.html`
- `/nomad/index.html`

## Mapeamento EN ↔ PT

| Arquivo EN | Arquivo PT | URL EN | URL PT |
|---|---|---|---|
| `/index.html` | `/pt/index.html` | `https://marlow.dev.br/` | `https://marlow.dev.br/pt/` |
| `/blog/index.html` | `/pt/blog/index.html` | `https://marlow.dev.br/blog/` | `https://marlow.dev.br/pt/blog/` |
| `/blog/ai-agents-copilot-studio.html` | `/pt/blog/ai-agents-copilot-studio.html` | `https://marlow.dev.br/blog/ai-agents-copilot-studio.html` | `https://marlow.dev.br/pt/blog/ai-agents-copilot-studio.html` |
| `/blog/uipath-optimization-playbook.html` | `/pt/blog/uipath-optimization-playbook.html` | `https://marlow.dev.br/blog/uipath-optimization-playbook.html` | `https://marlow.dev.br/pt/blog/uipath-optimization-playbook.html` |
| `/blog/bpmn-camunda-process-design.html` | `/pt/blog/bpmn-camunda-process-design.html` | `https://marlow.dev.br/blog/bpmn-camunda-process-design.html` | `https://marlow.dev.br/pt/blog/bpmn-camunda-process-design.html` |
| `/nomad/index.html` | `/pt/nomad/index.html` | `https://marlow.dev.br/nomad/` | `https://marlow.dev.br/pt/nomad/` |

## Processo

### Passo 1: Verificar Estado Atual

Para cada arquivo EN listado, verificar se já tem tags hreflang.
Se já tiver, reportar e pular esse arquivo.

### Passo 2: Inserir Hreflang em Cada Arquivo EN

Para cada arquivo EN **sem** hreflang, inserir após a tag `<link rel="canonical">`:

```html
  <!-- Hreflang Tags -->
  <link rel="alternate" hreflang="en" href="{URL_EN}">
  <link rel="alternate" hreflang="pt-BR" href="{URL_PT}">
  <link rel="alternate" hreflang="x-default" href="{URL_EN}">
```

**Como localizar o ponto de inserção:**
Procurar por `<link rel="canonical"` e inserir imediatamente após essa linha (com uma linha em branco de separação para legibilidade).

### Passo 3: Verificar Bidirectionalidade

Confirmar que os arquivos PT já têm hreflang apontando para EN. Se faltarem, corrigir também.

Estrutura esperada nos arquivos PT (verificar existência):
```html
<link rel="alternate" hreflang="en" href="{URL_EN}">
<link rel="alternate" hreflang="pt-BR" href="{URL_PT}">
<link rel="alternate" hreflang="x-default" href="{URL_EN}">
```

### Passo 4: Validar Alterações

Após modificar todos os arquivos:
- Verificar que cada arquivo EN tem exatamente 3 tags hreflang
- Verificar que as URLs são absolutas
- Verificar que a URL `hreflang="en"` aponta para o próprio arquivo EN
- Verificar que a URL `hreflang="pt-BR"` aponta para o arquivo PT correspondente

### Passo 5: Reportar

```
Fix Hreflang - Relatório de Execução
=====================================

Arquivos corrigidos:
  ✓ /index.html — hreflang adicionado
  ✓ /blog/index.html — hreflang adicionado
  ✓ /blog/ai-agents-copilot-studio.html — hreflang adicionado
  ✓ /blog/uipath-optimization-playbook.html — hreflang adicionado
  ✓ /blog/bpmn-camunda-process-design.html — hreflang adicionado
  ✓ /nomad/index.html — hreflang adicionado

Arquivos PT verificados:
  ✓ /pt/index.html — hreflang já existente e correto
  ✓ /pt/blog/index.html — hreflang já existente e correto
  ✓ /pt/blog/ai-agents-copilot-studio.html — hreflang já existente e correto
  ... (etc)

Total: {N} arquivos corrigidos, {M} já estavam corretos

Validação final:
  ✓ Bidireccionalidade confirmada (EN ↔ PT)
  ✓ URLs absolutas em todos os hreflang
  ✓ Valores de hreflang corretos (en, pt-BR, x-default)

✅ Problema de hreflang resolvido!

Próximos passos:
  1. Executar /pre-deploy para confirmar resolução completa
  2. Usar ./deploy.sh para publicar as correções
  3. Esta skill pode ser deletada após confirmação do deploy
```

## Nota Técnica

O `hreflang="x-default"` sempre aponta para a versão EN (versão padrão/universal), pois inglês é o idioma principal do site.
