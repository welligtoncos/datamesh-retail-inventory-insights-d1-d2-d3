# Code Generation Plan · U8 Portal Web Insights D-1

**Stories:** E8-US07  
**Unit:** U8-Portal-Web  
**Status:** Part 2 — concluído (E8-US07 done)  
**Data:** 2026-06-30

---

## Unit Context

- Brownfield: `portal-web/` com enriquecido E8-US06 (commit `ac1f9d9`)
- Rota `/insights/d1` = `InsightsD1PageComponent`
- Mock: agregar rows `enriquecido-mock.data.ts` para dt `2022-01-01`, `2022-01-02`
- Lambda referência: `gerar_relatorio_d1.py` — paridade agregação + insight text
- Design: `aidlc-docs/construction/u8-portal-web/insights-d1/`

---

## Steps (Part 2 — após aprovação)

- [x] Step 1: Criar `core/api/models/insights-d1.model.ts` (DTOs RF-API-08, RF-API-11)
- [x] Step 2: Criar `d1-aggregate.util.ts`, `d1-date.util.ts`, `d1-report-key.util.ts`
- [x] Step 3: Exportar `getMockEnriquecidoRows(dt)` em `enriquecido-mock.data.ts`
- [x] Step 4: Criar `core/api/data/insights-d1-mock.data.ts`
- [x] Step 5: Criar `InsightsD1ApiService` — `getInsight(dt)`, `getDownload(dt)`
- [x] Step 6: Implementar `InsightsD1FacadeService` (API + mock fallback)
- [x] Step 7: Criar `D1DateSelectorComponent` (RF-M4-01)
- [x] Step 8: Criar `D1InsightPanelComponent` (RF-M4-07)
- [x] Step 9: Criar `D1RankingTableComponent` (RF-M4-02)
- [x] Step 10: Criar `D1DownloadButtonComponent` (RF-M4-05)
- [x] Step 11: Criar `D1MissingPartitionBannerComponent` (RF-M4-06)
- [x] Step 12: Criar `InsightsD1PageComponent` (layout + estados + query `?dt=`)
- [x] Step 13: Atualizar `app.routes.ts` — `/insights/d1` → `InsightsD1PageComponent`
- [x] Step 14: Garantir home, enriquecido, origem inalterados (regressão specs)
- [x] Step 15: Unit tests — aggregate PBT, facade, date/report utils, insight text
- [x] Step 16: `scripts/w7-us07-validate.ps1`
- [x] Step 17: Atualizar `portal-web/README.md` e `insights-d1/code-summary.md`
- [x] Step 18: Atualizar `stories.md` E8-US07 → `done` após checklist manual

---

## Story Traceability

| Step | Critério aceite E8-US07 |
|------|-------------------------|
| 2, 4, 6 | Agregação Product ID + Category |
| 7 | RF-M4-01 seletor dt default ontem |
| 8 | RF-M4-07 insight textual |
| 9 | RF-M4-02 ranking unidades/receita |
| 10 | RF-M4-05 download presigned |
| 11 | RF-M4-06 CTA partição ausente |
| 5–6 | RF-API-08, RF-API-11 |
| 14 | Home dashboard não quebra |

---

## Arquivos principais

| Ação | Caminho |
|------|---------|
| Novo | `portal-web/src/app/features/insights/d1/` |
| Novo | `portal-web/src/app/core/api/insights-d1-api.service.ts` |
| Novo | `portal-web/src/app/core/api/insights-d1-facade.service.ts` |
| Novo | `portal-web/src/app/core/api/d1-aggregate.util.ts` |
| Novo | `portal-web/src/app/core/api/d1-date.util.ts` |
| Novo | `portal-web/src/app/core/api/d1-report-key.util.ts` |
| Novo | `portal-web/src/app/core/api/data/insights-d1-mock.data.ts` |
| Novo | `portal-web/src/app/core/api/models/insights-d1.model.ts` |
| Alterar | `portal-web/src/app/core/api/data/enriquecido-mock.data.ts` |
| Alterar | `portal-web/src/app/app.routes.ts` |
| Novo | `scripts/w7-us07-validate.ps1` |

---

## Fora de escopo Part 2

- D-2/D-3 dashboards (E8-US08)
- POST `/pipeline/processar-dia` (E8-US09)
- FastAPI BFF completo (E8-US12)
- Terraform / Lambda changes
- Leitura Parquet no browser
