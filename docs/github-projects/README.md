# GitHub Project V2 IDs (Secrets Setup)

Este guia mostra como coletar os IDs necessários para os workflows de pipeline e stage.

Arquivos relacionados:

- Query GraphQL: `docs/github-projects/get-project-v2-ids.graphql`
- Pipelines: `docs/content-pipelines.md`

## 1. Rodar a query no GraphQL Explorer

Abra:

- https://docs.github.com/en/graphql/overview/explorer

Cole a query do arquivo `docs/github-projects/get-project-v2-ids.graphql`.

Use variáveis neste formato:

```json
{
  "owner": "marlowsb",
  "number": 1
}
```

Troque `number` para consultar cada Project v2.

## 2. Mapear IDs para Secrets

Da resposta da query:

- `projectV2.id` -> use em:
  - `BLOGPOST_PROJECT_ID` (project de blogpost)
  - `NEWSLETTER_PROJECT_ID` (project de newsletter)

No array `fields.nodes`, encontre o field `stage` (single select):

- `fields.nodes[].id` (onde `name == "stage"`) -> `STAGE_FIELD_ID`

Para cada opção de `stage`, mapeie o `options[].id`:

- `idea` -> `STAGE_OPTION_IDEA`
- `research` -> `STAGE_OPTION_RESEARCH`
- `draft` -> `STAGE_OPTION_DRAFT`
- `review` -> `STAGE_OPTION_REVIEW`
- `approved` -> `STAGE_OPTION_APPROVED`
- `scheduled` -> `STAGE_OPTION_SCHEDULED`
- `published` -> `STAGE_OPTION_PUBLISHED`

## 3. Salvar Secrets no repositório

No GitHub:

1. `Settings` -> `Secrets and variables` -> `Actions`
2. `New repository secret`
3. Criar todos os secrets acima

## 4. Validar

1. Abra uma issue usando:
   - `Novo Blog Post`, ou
   - `Nova Newsletter`
2. Adicione um label `stage:*` (ex: `stage:draft`)
3. Verifique:
   - label de pipeline correta
   - item no Project correto
   - campo `stage` no Project sincronizado

## Notas

- Se os secrets de stage não existirem, o workflow ainda sincroniza labels `stage:*` na issue.
- O update de campo no Project só acontece com `STAGE_FIELD_ID` + `STAGE_OPTION_*` configurados.
