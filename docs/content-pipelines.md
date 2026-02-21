# Content Pipelines (Blogpost + Newsletter)

Este repositório separa os fluxos de conteúdo em dois pipelines:

- `pipeline:blogpost`
- `pipeline:newsletter`

## O que foi automatizado

- Issue template de blog post já cria label `pipeline:blogpost`.
- Issue template de newsletter já cria label `pipeline:newsletter`.
- Workflow `.github/workflows/route-content-pipelines.yml`:
  - Garante exclusividade de pipeline (remove label oposta).
  - Roteia para o Project correto.
  - Remove do Project errado quando necessário.
  - Mantém compatibilidade com label legado `blog-post`.

## Secrets necessários

Defina estes secrets no repositório (Settings > Secrets and variables > Actions):

- `BLOGPOST_PROJECT_ID`
- `NEWSLETTER_PROJECT_ID`

Valor esperado: **Node ID** de cada GitHub Project v2.

## Como obter os IDs (Project e Stage)

Use o guia completo em `docs/github-projects/README.md` e a query em `docs/github-projects/get-project-v2-ids.graphql`.

## Sync de stage (opcional)

O workflow `.github/workflows/sync-content-stage.yml` sincroniza:

- labels `stage:*` na issue (sempre apenas uma);
- campo de status/stage no Project (quando IDs de field/options forem fornecidos).

### Regras de stage

- Issue aberta sem stage recebe `stage:idea`.
- Ao fechar a issue, vira `stage:published`.
- Se houver múltiplos stages, o workflow mantém apenas um.

### Secrets opcionais para atualizar campo no Project

- `STAGE_FIELD_ID`
- `STAGE_OPTION_IDEA`
- `STAGE_OPTION_RESEARCH`
- `STAGE_OPTION_DRAFT`
- `STAGE_OPTION_REVIEW`
- `STAGE_OPTION_APPROVED`
- `STAGE_OPTION_SCHEDULED`
- `STAGE_OPTION_PUBLISHED`

Se esses secrets não estiverem definidos, o sync continua funcionando apenas via labels.

## Comportamento esperado

- Card com `pipeline:blogpost` entra apenas no Project de blogpost.
- Card com `pipeline:newsletter` entra apenas no Project de newsletter.
- Se um card estiver em ambos por algum motivo, a automação corrige automaticamente.
- Sem label de pipeline, não há roteamento para Project.
