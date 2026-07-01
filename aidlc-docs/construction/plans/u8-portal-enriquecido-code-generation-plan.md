# Code Generation Plan · U8 Portal Web Enriquecido

**Stories:** E8-US06  
**Unit:** U8-Portal-Web  
**Status:** Part 2 — concluído (E8-US06 done)  
**Data:** 2026-06-30

---

## Unit Context

- Brownfield: `portal-web/` com origem E8-US05 (commit `ef57bb6`)
- Rota `/enriquecido` = `EnriquecidoPageComponent`
- Mock: 2 dt (`2022-01-01`, `2022-01-02`), 100 rows, 20 cols preview
- Design: `aidlc-docs/construction/u8-portal-web/enriquecido/`

---

## Steps (Part 2 — após aprovação)

- [x] Step 1: Estender `core/api/models/enriquecido.model.ts` (KPIs + preview DTOs)
- [x] Step 2: Criar `core/api/data/enriquecido-mock.data.ts`
- [x] Step 3: Estender `EnriquecidoApiService` — `getPreview(dt, page, pageSize)`
- [x] Step 4: Implementar `EnriquecidoFacadeService` (API + mock fallback)
- [x] Step 5: Criar `enriquecido-partition.util.ts` + `enriquecido-compare.util.ts`
- [x] Step 6: Criar `EnriquecidoPartitionsPanelComponent`
- [x] Step 7: Criar `EnriquecidoKpiPanelComponent` (RF-M3-02)
- [x] Step 8: Criar `EnriquecidoPreviewTableComponent` (RF-M3-03)
- [x] Step 9: Criar `EnriquecidoComparePanelComponent` (RF-M3-04)
- [x] Step 10: Criar `EnriquecidoPageComponent` (layout + estados)
- [x] Step 11: Atualizar `app.routes.ts` — `/enriquecido` → `EnriquecidoPageComponent`
- [x] Step 12: Garantir `DashboardService` + specs inalterados (regressão)
- [x] Step 13: Unit tests — facade, compare util, preview cap 500
- [x] Step 14: `scripts/w7-us06-validate.ps1`
- [x] Step 15: Atualizar `portal-web/README.md` e `enriquecido/code-summary.md`
- [x] Step 16: Atualizar `stories.md` E8-US06 → `done` após checklist manual

---

## Story Traceability

| Step | Critério aceite E8-US06 |
|------|-------------------------|
| 3–4 | RF-API-06, RF-API-07 |
| 6 | RF-M3-01 lista dt |
| 7 | RF-M3-02 KPIs |
| 8 | RF-M3-03 preview ≤500 paginado |
| 9 | RF-M3-04 comparativo delta |
| 12 | Home dashboard não quebra |

---

## Arquivos principais

| Ação | Caminho |
|------|---------|
| Novo | `portal-web/src/app/features/enriquecido/` |
| Novo | `portal-web/src/app/core/api/enriquecido-facade.service.ts` |
| Novo | `portal-web/src/app/core/api/data/enriquecido-mock.data.ts` |
| Alterar | `portal-web/src/app/core/api/enriquecido-api.service.ts` |
| Alterar | `portal-web/src/app/core/api/models/enriquecido.model.ts` |
| Alterar | `portal-web/src/app/app.routes.ts` |
| Novo | `scripts/w7-us06-validate.ps1` |

---

## Fora de escopo Part 2

- RF-M3-05 Athena (E8-US11)
- FastAPI BFF completo (E8-US12)
- POST pipeline (E8-US09)
- Leitura real Parquet no browser
- Terraform / Glue changes
