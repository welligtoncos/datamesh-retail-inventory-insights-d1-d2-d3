# Code Summary · U8 Portal Web Insights D-2 e D-3 (E8-US08)

**Status:** Design Part 1 concluído — código pendente (Part 2)  
**Data:** 2026-06-30

---

## Escopo implementado (planejado Part 2)

| Área | Entrega |
|------|---------|
| Rotas | `/insights/d2`, `/insights/d3` |
| D-2 | Rupturas `_lost` desc + insight + download |
| D-3 | Tendência janela N + úteis/FDS + chips + download |
| Shared | Componentes extraídos de D-1 |
| Mock | Filtro/agregação sobre enriquecido-mock |
| Validação | `scripts/w7-us08-validate.ps1` |

---

## Rastreabilidade

| Requisito | Artefato |
|-----------|----------|
| RF-M4-03 | `D2RupturasTableComponent` + `d2-filter.util` |
| RF-M4-04 | `D3TrendTableComponent` + `d3-trend.util` |
| RF-M4-05 | Download D-2/D-3 |
| RF-M4-06 | `InsightMissingPartitionBannerComponent` |
| RF-M4-07 | `InsightPanelComponent` |
| RF-API-09 | `GET /insights/d2?dt=` |
| RF-API-10 | `GET /insights/d3?dt=&window=` |

---

## Referências brownfield

- `lambda/reports/gerar_relatorio_d2.py`
- `lambda/reports/gerar_relatorio_d3.py`
- `lambda/reports/common.py` — `date_range`
