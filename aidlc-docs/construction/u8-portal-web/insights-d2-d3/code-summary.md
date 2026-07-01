# Code Summary · U8 Portal Web Insights D-2 e D-3 (E8-US08)

**Status:** Part 2 implementado — E8-US08 done  
**Data:** 2026-06-30

---

## Escopo implementado

| Área | Entrega |
|------|---------|
| Rotas | `/insights/d2`, `/insights/d3` |
| D-2 | Rupturas `_stockout==1` ∧ `_lost>0`, sort `_lost` desc + insight + download |
| D-3 | Tendência janela N (3/7/14), úteis vs FDS, chips + download |
| Shared | `features/insights/shared/` extraído de D-1 |
| Mock | `insights-d2-mock.data.ts`, `insights-d3-mock.data.ts` sobre enriquecido-mock |
| Validação | `scripts/w7-us08-validate.ps1` — 79 specs |

---

## Arquivos principais

| Caminho | Papel |
|---------|-------|
| `core/api/d2-filter.util.ts` | Filtro rupturas + insight D-2 |
| `core/api/d3-trend.util.ts` | Janela, tendência ±5%, insight D-3 |
| `core/api/insights-d2-facade.service.ts` | API + fallback mock D-2 |
| `core/api/insights-d3-facade.service.ts` | API + fallback mock D-3 |
| `features/insights/shared/` | Date selector, panel, download, banner |
| `features/insights/d2/` | Page + tabela rupturas |
| `features/insights/d3/` | Page + tabela tendência + seletor janela |
| `features/insights/d1/` | Refatorado para shared (sem mudança funcional) |

---

## Mock brownfield

| dt | D-2 | D-3 |
|----|-----|-----|
| `2022-01-01` | Zero rupturas | Tendências na janela |
| `2022-01-02` | Rupturas com `_lost` | Tendências na janela |

---

## Rastreabilidade

| Requisito | Artefato |
|-----------|----------|
| RF-M4-03 | `D2RupturasTableComponent` + `d2-filter.util` |
| RF-M4-04 | `D3TrendTableComponent` + `d3-trend.util` |
| RF-M4-05 | `InsightDownloadButtonComponent` D-2/D-3 |
| RF-M4-06 | `InsightMissingPartitionBannerComponent` |
| RF-M4-07 | `InsightPanelComponent` (temas blue/red/green) |
| RF-API-09 | `GET /insights/d2?dt=` |
| RF-API-10 | `GET /insights/d3?dt=&window=` |
| RF-API-11 | `GET /insights/d2/download`, `/insights/d3/download` |

---

## Referências brownfield

- `lambda/reports/gerar_relatorio_d2.py`
- `lambda/reports/gerar_relatorio_d3.py`
- `lambda/reports/common.py` — `date_range`
