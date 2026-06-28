# Requirements · W2 Origem (E2-US01–E2-US03)

**Unidade:** u2-origem · **Onda:** W2 · **Data:** 2026-06-28

## Escopo

Replicar `carregar_origem_dia(dt)` do notebook na AWS via **Glue Python Shell** (pandas/pyarrow — paridade exata com `data.parquet`).

## Requisitos funcionais

| ID | Story | Requisito |
|----|-------|-----------|
| RF-W2-01 | E2-US01 | Job lê CSV em `insumo/`, filtra `Date == dt`, grava `origem/dt={dt}/data.parquet` |
| RF-W2-02 | E2-US02 | Parâmetro `--dt` isolado; overwrite só da partição; logs row count + duração |
| RF-W2-03 | E2-US03 | Paridade row count/colunas/tipos vs `tabela_origem/dt=2022-01-01` local |

## Decisões

| Decisão | Valor |
|---------|-------|
| Compute | Glue Python Shell (não PySpark — paridade `data.parquet`) |
| Role | `retail-inventory-glue-dev` (existente) |
| Job name | `retail-inventory-insights-carregar-origem-dia-dev` |
| Fora de escopo | enriquecer_dia, Step Functions, Lambda |

## NFR

- Idempotente (delete prefix + rewrite)
- SCHEMA 15 colunas validado antes de processar
- Região us-east-1
