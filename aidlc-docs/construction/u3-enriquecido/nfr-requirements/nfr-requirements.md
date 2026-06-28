# Requirements · W3 Enriquecido (E3-US01–E3-US03)

**Unidade:** u3-enriquecido · **Onda:** W3 · **Região:** us-east-1 · **Bucket:** retail-inventory-insights-dev-use1

## Requisitos funcionais

| ID | Story | Descrição |
|----|-------|-----------|
| RF-W3-01 | E3-US01 | Job lê `origem/dt={dt}/data.parquet`, aplica métricas `_*`, grava `enriquecido/dt={dt}/data.parquet` |
| RF-W3-02 | E3-US02 | Log com % `_stockout`, soma `_revenue`; sanidade documentada |
| RF-W3-03 | E3-US03 | Paridade colunas `_*` + `dt`, soma revenue e contagem stockout vs local |

## Métricas brownfield (notebook)

- `_revenue = Units Sold * Price` (round 2)
- `_stockout = (Units Sold >= Inventory Level) & (Demand Forecast > Inventory Level)`
- `_lost = max(Demand Forecast - Units Sold, 0) if _stockout else 0` (round 1)
- `_is_weekend = weekday >= 5`
- `dt = str(date)`

## Fora de escopo W3

Step Functions, EventBridge, Lambda Excel (W4+)
