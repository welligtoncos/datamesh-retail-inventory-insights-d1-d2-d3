# Requirements · W4 Orquestracao (E4-US01–E4-US03)

**Unidade:** u4-orquestracao · **Onda:** W4 · **Região:** us-east-1

## Requisitos funcionais

| ID | Story | Descrição |
|----|-------|-----------|
| RF-W4-01 | E4-US01 | Step Functions `processar_dia`: Glue origem → Glue enriquecido para `dt` |
| RF-W4-02 | E4-US02 | EventBridge cron opcional (dev: DISABLED; execução manual documentada) |
| RF-W4-03 | E4-US03 | CloudWatch Logs ALL em `/aws/states/retail-inventory-insights-processar-dia-dev` |

## Comportamento brownfield

Réplica `processar_dia(dt)` = `carregar_origem_dia(dt)` + `enriquecer_dia(dt)` sequencial.

## Fora de escopo W4

Lambda Excel (W5), Athena (W6)
