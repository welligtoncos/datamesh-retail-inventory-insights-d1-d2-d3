# Code Summary · U8 Portal Web Enriquecido (E8-US06)

**Story:** E8-US06 · Partições enriquecido, KPIs e comparativo (M3)  
**Data:** 2026-06-30

---

## Entregáveis

| Artefato | Caminho |
|----------|---------|
| Models (estendidos) | `portal-web/src/app/core/api/models/enriquecido.model.ts` |
| Mock brownfield | `portal-web/src/app/core/api/data/enriquecido-mock.data.ts` |
| API + Facade | `enriquecido-api.service.ts`, `enriquecido-facade.service.ts` |
| Utils | `enriquecido-partition.util.ts`, `enriquecido-compare.util.ts` |
| Feature | `portal-web/src/app/features/enriquecido/` |
| Rota | `/enriquecido` → `EnriquecidoPageComponent` |
| Validação | `scripts/w7-us06-validate.ps1` |

---

## Critérios de aceite

| RF | Implementação |
|----|---------------|
| RF-M3-01 | `EnriquecidoPartitionsPanelComponent` |
| RF-M3-02 | `EnriquecidoKpiPanelComponent` |
| RF-M3-03 | `EnriquecidoPreviewTableComponent` + `getPreview()` |
| RF-M3-04 | `EnriquecidoComparePanelComponent` + compare util |
| RF-API-06/07 | `EnriquecidoApiService` + mock fallback |

---

## Testes unitários

- `enriquecido-facade.service.spec.ts` — 404 → mock, compare, MOCK_KPIS
- `enriquecido-compare.util.spec.ts` — delta B − A
- `enriquecido-partition.util.spec.ts` — sort, default compare pair
- `dashboard.service.spec.ts` — regressão home inalterada

---

## Mock dev

- `partitions`: `['2022-01-02', '2022-01-01']`
- KPIs A: paridade `MOCK_KPIS` home (revenue 879026.03)
- KPIs B: variante com 3 rupturas, lost 42.5
- Preview: 100 linhas, 20 colunas, 2 páginas × 50
