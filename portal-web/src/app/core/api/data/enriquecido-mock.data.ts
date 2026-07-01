import { ORIGEM_SCHEMA_COLUMNS } from './origem-mock.data';
import { EnriquecidoKpis, EnriquecidoPreviewResponse, PartitionListResponse } from '../models/enriquecido.model';
import {
  PREVIEW_PAGE_SIZE,
  clampPreviewTotalRows,
  slicePreviewPage,
} from '../origem-preview.util';

export const MOCK_ENRIQ_DT_A = '2022-01-01';
export const MOCK_ENRIQ_DT_B = '2022-01-02';

export const ENRIQUECIDO_DERIVED_COLUMNS = [
  '_revenue',
  '_stockout',
  '_lost',
  '_is_weekend',
  'dt',
] as const;

export const ENRIQUECIDO_PREVIEW_COLUMNS = [
  ...ORIGEM_SCHEMA_COLUMNS,
  ...ENRIQUECIDO_DERIVED_COLUMNS,
];

const MOCK_ROW_COUNT = 100;

const CATEGORIES = ['Electronics', 'Furniture', 'Clothing', 'Food', 'Toys'];
const REGIONS = ['North', 'South', 'East', 'West'];
const WEATHER = ['Sunny', 'Rainy', 'Cloudy', 'Windy'];
const SEASONS = ['Spring', 'Summer', 'Fall', 'Winter'];

export const MOCK_ENRIQUECIDO_PARTITIONS: PartitionListResponse = {
  partitions: [MOCK_ENRIQ_DT_B, MOCK_ENRIQ_DT_A],
  latest: MOCK_ENRIQ_DT_B,
};

/** Paridade E5-US03 / athena-validation-queries.md (preview sintético difere do parquet). */
export const MOCK_D1_PARITY_BY_DT: Record<
  string,
  { produtos_distintos: number; total_unidades: number; total_receita: number }
> = {
  [MOCK_ENRIQ_DT_A]: {
    produtos_distintos: 69,
    total_unidades: 14484,
    total_receita: 879_026.03,
  },
};

const MOCK_KPIS_BY_DT: Record<string, EnriquecidoKpis> = {
  [MOCK_ENRIQ_DT_A]: {
    dt: MOCK_ENRIQ_DT_A,
    row_count: 100,
    revenue_total: 879_026.03,
    stockout_pct: 0,
    products_stockout: 0,
    stores_count: 10,
    stockout_count: 0,
    lost_total: 0,
    is_weekend: true,
  },
  [MOCK_ENRIQ_DT_B]: {
    dt: MOCK_ENRIQ_DT_B,
    row_count: 100,
    revenue_total: 835_074.73,
    stockout_pct: 3,
    products_stockout: 3,
    stores_count: 10,
    stockout_count: 3,
    lost_total: 42.5,
    is_weekend: true,
  },
};

function buildEnrichedRow(dt: string, index: number): Record<string, unknown> {
  const storeNum = (index % 10) + 1;
  const productNum = (index % 69) + 1;
  const unitsSold = 5 + (index % 25);
  const price = Number((9.99 + (index % 50) * 0.5).toFixed(2));
  const inventory = 20 + (index % 80);
  const demand = 15 + (index % 35);
  const stockout =
    dt === MOCK_ENRIQ_DT_B && index % 33 === 0
      ? 1
      : (unitsSold >= inventory && demand > inventory ? 1 : 0);
  const lost = stockout === 1 ? Math.max(0, demand - unitsSold) : 0;
  const revenue = Number((unitsSold * price).toFixed(2));

  return {
    Date: dt,
    'Store ID': `S${storeNum}`,
    'Product ID': `P${String(productNum).padStart(3, '0')}`,
    Category: CATEGORIES[index % CATEGORIES.length],
    Region: REGIONS[index % REGIONS.length],
    'Inventory Level': inventory,
    'Units Sold': unitsSold,
    'Units Ordered': 10 + (index % 30),
    'Demand Forecast': demand,
    Price: price,
    Discount: index % 5 === 0 ? 0.1 : 0,
    'Weather Condition': WEATHER[index % WEATHER.length],
    'Holiday/Promotion': index % 7 === 0 ? 'Yes' : 'No',
    'Competitor Pricing': Number((8.99 + (index % 40) * 0.45).toFixed(2)),
    Seasonality: SEASONS[index % SEASONS.length],
    _revenue: revenue,
    _stockout: stockout,
    _lost: Number(lost.toFixed(1)),
    _is_weekend: 1,
    dt,
  };
}

const ALL_MOCK_ROWS: Record<string, Record<string, unknown>[]> = {
  [MOCK_ENRIQ_DT_A]: Array.from({ length: MOCK_ROW_COUNT }, (_, i) =>
    buildEnrichedRow(MOCK_ENRIQ_DT_A, i),
  ),
  [MOCK_ENRIQ_DT_B]: Array.from({ length: MOCK_ROW_COUNT }, (_, i) =>
    buildEnrichedRow(MOCK_ENRIQ_DT_B, i),
  ),
};

export function buildMockEnriquecidoKpis(dt: string): EnriquecidoKpis {
  const normalized = dt.trim().slice(0, 10);
  return { ...(MOCK_KPIS_BY_DT[normalized] ?? MOCK_KPIS_BY_DT[MOCK_ENRIQ_DT_A]) };
}

export function buildMockEnriquecidoPreview(
  dt: string,
  page = 1,
  pageSize = PREVIEW_PAGE_SIZE,
): EnriquecidoPreviewResponse {
  const normalized = dt.trim().slice(0, 10);
  const allRows = ALL_MOCK_ROWS[normalized] ?? ALL_MOCK_ROWS[MOCK_ENRIQ_DT_A];
  const totalRows = clampPreviewTotalRows(allRows.length);
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const rows = slicePreviewPage(allRows, safePage, pageSize);

  return {
    dt: normalized,
    columns: [...ENRIQUECIDO_PREVIEW_COLUMNS],
    rows,
    page: safePage,
    page_size: pageSize,
    total_pages: totalPages,
    total_rows: totalRows,
  };
}

export function isMockEnriquecidoDt(dt: string): boolean {
  const normalized = dt.trim().slice(0, 10);
  return normalized === MOCK_ENRIQ_DT_A || normalized === MOCK_ENRIQ_DT_B;
}

export function getMockEnriquecidoRows(dt: string): Record<string, unknown>[] {
  const normalized = dt.trim().slice(0, 10);
  return ALL_MOCK_ROWS[normalized] ?? [];
}
