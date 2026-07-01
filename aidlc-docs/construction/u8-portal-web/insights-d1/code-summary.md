# Code Summary · U8 Portal Web Insights D-1 (E8-US07)

**Status:** Design Part 1 concluído — código pendente (Part 2)  
**Data:** 2026-06-30

---

## Escopo implementado (planejado Part 2)

| Área | Entrega |
|------|---------|
| Rota | `/insights/d1` → `InsightsD1PageComponent` |
| API | `InsightsD1ApiService` + `InsightsD1FacadeService` |
| Agregação | `d1-aggregate.util.ts` (paridade Lambda D-1) |
| UI | Seletor dt, insight, ranking, download, banner ausência |
| Mock | Agregação sobre `enriquecido-mock.data.ts` |
| Testes | PBT aggregate + facade fallback |
| Validação | `scripts/w7-us07-validate.ps1` |

---

## Rastreabilidade

| Requisito | Artefato |
|-----------|----------|
| RF-M4-01 | `D1DateSelectorComponent` |
| RF-M4-02 | `D1RankingTableComponent` |
| RF-M4-05 | `D1DownloadButtonComponent` |
| RF-M4-06 | `D1MissingPartitionBannerComponent` |
| RF-M4-07 | `D1InsightPanelComponent` |
| RF-API-08 | `GET /insights/d1?dt=` |
| RF-API-11 | `GET /insights/d1/download?dt=` |

---

## Referências brownfield

- `lambda/reports/gerar_relatorio_d1.py`
- `Esteira_3Relatorios_D1_D2_D3.ipynb` §3
- `relatorios/D1/relatorio_D1_exec2022-01-02_dado2022-01-01.xlsx`
