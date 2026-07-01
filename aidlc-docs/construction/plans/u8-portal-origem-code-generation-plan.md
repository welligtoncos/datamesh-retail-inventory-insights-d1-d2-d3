# Code Generation Plan · U8 Portal Web Origem

**Stories:** E8-US05  
**Unit:** U8-Portal-Web  
**Status:** Part 2 — concluído (E8-US05 done)  
**Data:** 2026-06-30

---

## Unit Context

- Brownfield: `portal-web/` com insumos E8-US04 (commit `da40b09`)
- Rota `/origem` = `OrigemPageComponent`
- Mock: `dt=2022-01-01`, 100 rows, 15 cols SCHEMA
- Design: `aidlc-docs/construction/u8-portal-web/origem/`

---

## Steps (Part 2 — após aprovação)

- [x] Step 1: Criar `core/api/models/origem.model.ts`
- [x] Step 2: Criar `core/api/data/origem-mock.data.ts` (partitions + preview sintético)
- [x] Step 3: Implementar `OrigemApiService` (partitions + preview com query params)
- [x] Step 4: Implementar `OrigemFacadeService` (API + mock fallback)
- [x] Step 5: Criar `origem-partition.util.ts` (sort, normalize dt)
- [x] Step 6: Criar `OrigemPartitionsPanelComponent` + `OrigemMissingDtChipComponent`
- [x] Step 7: Criar `OrigemPartitionDetailComponent` (3 KPI cards)
- [x] Step 8: Criar `OrigemPreviewTableComponent` (mat-table + mat-paginator)
- [x] Step 9: Criar `OrigemPageComponent` (layout master-detail + estados)
- [x] Step 10: Atualizar `app.routes.ts` — `/origem` → `OrigemPageComponent`
- [x] Step 11: `MatPaginatorIntl` PT-BR (opcional provider)
- [x] Step 12: Unit tests — facade, partition util, preview cap 500
- [x] Step 13: `scripts/w7-us05-validate.ps1`
- [x] Step 14: Atualizar `portal-web/README.md` e `origem/code-summary.md`
- [x] Step 15: Atualizar `stories.md` E8-US05 → `done` após checklist manual

---

## Story Traceability

| Step | Critério aceite E8-US05 |
|------|-------------------------|
| 3–4 | RF-API-04, RF-API-05 |
| 6–9 | RF-M2-01 lista/calendário dt |
| 7 | RF-M2-02 KPIs |
| 8 | RF-M2-03 preview ≤500 paginado |
| 6 | RF-M2-04 missing dt visual |

---

## Arquivos principais

| Ação | Caminho |
|------|---------|
| Novo | `portal-web/src/app/features/origem/` |
| Novo | `portal-web/src/app/core/api/origem-*.ts` |
| Novo | `portal-web/src/app/core/api/data/origem-mock.data.ts` |
| Alterar | `portal-web/src/app/app.routes.ts` |
| Novo | `scripts/w7-us05-validate.ps1` |

---

## Fora de escopo Part 2

- FastAPI BFF (E8-US12)
- POST pipeline reprocessar (E8-US09)
- Leitura real Parquet no browser
- Terraform / Glue changes
