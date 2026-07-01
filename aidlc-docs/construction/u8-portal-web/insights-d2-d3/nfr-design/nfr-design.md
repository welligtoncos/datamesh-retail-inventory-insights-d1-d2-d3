# NFR Design · U8 Portal Web Insights D-2 e D-3 (E8-US08)

**Data:** 2026-06-30

---

## d2-filter.util — implementação

```typescript
export interface EnriquecidoRupturaInput {
  storeId: string;
  productId: string;
  category: string;
  inventoryLevel: number;
  unitsSold: number;
  demandForecast: number;
  stockout: number;
  lost: number;
}

export function mapEnriquecidoRowToRupturaInput(
  row: Record<string, unknown>,
): EnriquecidoRupturaInput { /* ... */ }

export function filterRupturas(
  rows: EnriquecidoRupturaInput[],
  dt: string,
  partitionExists: boolean,
): InsightsD2Response { /* ... */ }
```

- Mapper em `d2-filter.util.ts` (não reutilizar `mapEnriquecidoRowToInput` de D-1 — grão diferente)

---

## d3-trend.util — implementação

```typescript
export const DEFAULT_D3_WINDOW = 7;
export const D3_WINDOW_OPTIONS = [3, 7, 14] as const;

export function insightDateRange(endDt: string, windowDays: number): string[] {
  // paridade common.date_range
}

export function computeTrends(
  rowsByDt: Record<string, Record<string, unknown>[]>,
  dt: string,
  windowDays: number,
): InsightsD3Response { /* ... */ }
```

- Carregar mock: para cada dt em `dateRange`, `getMockEnriquecidoRows(dt)` se existir
- `partitions_read = count(distinct dt com rows)`

---

## D2RupturasTableComponent

```typescript
const DISPLAYED_COLUMNS = [
  'store_id', 'product_id', 'category',
  'inventory_level', 'units_sold', 'demand_forecast', 'lost',
];
```

- Destaque visual na 1ª linha (maior `_lost`) — `font-weight: 500` na coluna perdida
- Paginação 25/página

---

## D3TrendTableComponent

```typescript
const DISPLAYED_COLUMNS = [
  'store_id', 'product_id', 'category',
  'avg_weekday', 'avg_weekend', 'trend_pct', 'trend_label',
];
```

- Coluna `trend_label`: `mat-chip` inline
  - Subindo → `color="primary"`
  - Caindo → `color="warn"`
  - Estável → default

---

## InsightPanelComponent (shared)

```typescript
@Input() insightText = '';
@Input() theme: 'blue' | 'red' | 'green' = 'blue';
```

- D-1: `blue` (existente)
- D-2: `red` (`#FEE2E2` / `#DC2626`)
- D-3: `green` (`#D1FAE5` / `#059669`)

---

## InsightDownloadButtonComponent (shared)

```typescript
@Input() downloadFn!: (dt: string, window?: number) => Observable<InsightsDownloadResult>;
```

- D-2: `downloadFn(dt)`
- D-3: `downloadFn(dt, window)`

---

## Responsividade

| Breakpoint | Layout |
|------------|--------|
| ≥ 960px | Toolbar: seletor dt + (janela D-3) + download |
| &lt; 960px | Stack vertical full-width |

---

## Refactor D-1 (Part 2)

1. Mover 4 componentes para `features/insights/shared/`
2. Atualizar `insights/d1/*.ts` imports
3. Executar `ng test` — regressão 59+ testes

---

## Testes (PBT leve)

| Arquivo | Propriedade |
|---------|-------------|
| `d2-filter.util.spec.ts` | filtro + sort + total_lost |
| `d3-trend.util.spec.ts` | labels ±5%, partitions_read |
| `insights-d2-facade.service.spec.ts` | 404 → mock |
| `insights-d3-facade.service.spec.ts` | window param |

---

## Extension compliance (E8-US08)

| Extension | Status |
|-----------|--------|
| Security Baseline | Compliant |
| Resiliency Baseline | Compliant |
| Property-Based Testing | Compliant |
