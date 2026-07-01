# Code Summary · U8 Portal Web Operações Pipeline (E8-US09)

**Status:** Part 2 implementado — E8-US09 done  
**Data:** 2026-06-30

---

## Escopo implementado

| Área | Entrega |
|------|---------|
| Rota | `/operacoes` substitui placeholder |
| Disparo | POST `/pipeline/processar-dia` + mock fallback |
| Acompanhamento | Polling 15s RUNNING → terminal |
| Histórico | 20 execuções (tabela + chips) |
| Integração | Banner insights → `/operacoes?dt=` |
| Mock | `pipeline-execution-mock.store.ts` (RUNNING→SUCCEEDED ~8s) |
| Validação | `scripts/w7-us09-validate.ps1` — 94 specs |

---

## Arquivos principais

| Caminho | Papel |
|---------|-------|
| `core/api/pipeline-facade.service.ts` | API + mock + polling |
| `core/api/data/pipeline-execution-mock.store.ts` | Simulação SFN in-memory |
| `features/operacoes/operacoes-page.component.ts` | Página M5 |
| `features/insights/shared/insight-missing-partition-banner.component.ts` | Deep-link `?dt=` |

---

## Rastreabilidade

| Requisito | Artefato |
|-----------|----------|
| RF-M5-01 | POST processar-dia |
| RF-M5-02 | Polling + card ativo |
| RF-M5-03 | Tabela 20 execuções |
| RF-M6-04 | `audit` no response mock |
| RF-M4-06 | Banner queryParams |
| RF-API-12/13 | PipelineApiService |

---

## Referências brownfield

- SFN `retail-inventory-insights-processar-dia-dev`
- `scripts/reprocessar-dia-dev.ps1`
