# Code Summary · U8 Portal Web Origem (E8-US05)

**Story:** E8-US05 · Partições origem e preview (M2)  
**Data:** 2026-06-30

---

## Entregáveis

| Artefato | Caminho |
|----------|---------|
| Models | `portal-web/src/app/core/api/models/origem.model.ts` |
| Mock brownfield | `portal-web/src/app/core/api/data/origem-mock.data.ts` |
| API + Facade | `origem-api.service.ts`, `origem-facade.service.ts` |
| Utils | `origem-partition.util.ts`, `origem-preview.util.ts` |
| Feature | `portal-web/src/app/features/origem/` |
| Rota | `/origem` → `OrigemPageComponent` |
| i18n paginator | `shared/i18n/mat-paginator-intl.pt-br.ts` |
| Validação | `scripts/w7-us05-validate.ps1` |

---

## Critérios de aceite

| RF | Implementação |
|----|---------------|
| RF-M2-01 | `OrigemPartitionsPanelComponent` — lista dt= desc |
| RF-M2-02 | `OrigemPartitionDetailComponent` — 3 KPIs |
| RF-M2-03 | `OrigemPreviewTableComponent` — preview ≤500, page_size 50 |
| RF-M2-04 | `OrigemMissingDtChipComponent` — missing_dates |
| RF-API-04/05 | `OrigemApiService` + mock fallback |

---

## Testes unitários

- `origem-facade.service.spec.ts` — 404 → mock
- `origem-partition.util.spec.ts` — sort desc, missing
- `origem-preview.util.spec.ts` — cap 500, paginação

---

## Mock dev

- `partitions`: `['2022-01-01']`
- `missing_dates`: `['2022-01-02']`
- Preview: 100 linhas, 15 colunas SCHEMA, 2 páginas × 50
