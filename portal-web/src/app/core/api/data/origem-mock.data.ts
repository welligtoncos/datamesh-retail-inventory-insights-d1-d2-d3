import { OrigemPartitionsResponse, OrigemPreviewResponse } from '../models/origem.model';
import {
  PREVIEW_MAX_ROWS,
  PREVIEW_PAGE_SIZE,
  clampPreviewTotalRows,
  slicePreviewPage,
} from '../origem-preview.util';

export const MOCK_ORIGEM_DT = '2022-01-01';
export const MOCK_MISSING_DATES = ['2022-01-02'];

export const ORIGEM_SCHEMA_COLUMNS = [
  'Date',
  'Store ID',
  'Product ID',
  'Category',
  'Region',
  'Inventory Level',
  'Units Sold',
  'Units Ordered',
  'Demand Forecast',
  'Price',
  'Discount',
  'Weather Condition',
  'Holiday/Promotion',
  'Competitor Pricing',
  'Seasonality',
] as const;

const CATEGORIES = ['Electronics', 'Furniture', 'Clothing', 'Food', 'Toys'];
const REGIONS = ['North', 'South', 'East', 'West'];
const WEATHER = ['Sunny', 'Rainy', 'Cloudy', 'Windy'];
const SEASONS = ['Spring', 'Summer', 'Fall', 'Winter'];

const MOCK_ROW_COUNT = 100;
const MOCK_STORES_COUNT = 10;
const MOCK_PRODUCTS_COUNT = 69;

function buildMockRows(count: number): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = [];
  for (let i = 0; i < count; i++) {
    const storeNum = (i % MOCK_STORES_COUNT) + 1;
    const productNum = (i % MOCK_PRODUCTS_COUNT) + 1;
    rows.push({
      Date: MOCK_ORIGEM_DT,
      'Store ID': `S${storeNum}`,
      'Product ID': `P${String(productNum).padStart(3, '0')}`,
      Category: CATEGORIES[i % CATEGORIES.length],
      Region: REGIONS[i % REGIONS.length],
      'Inventory Level': 20 + (i % 80),
      'Units Sold': 5 + (i % 25),
      'Units Ordered': 10 + (i % 30),
      'Demand Forecast': 15 + (i % 35),
      Price: Number((9.99 + (i % 50) * 0.5).toFixed(2)),
      Discount: i % 5 === 0 ? 0.1 : 0,
      'Weather Condition': WEATHER[i % WEATHER.length],
      'Holiday/Promotion': i % 7 === 0 ? 'Yes' : 'No',
      'Competitor Pricing': Number((8.99 + (i % 40) * 0.45).toFixed(2)),
      Seasonality: SEASONS[i % SEASONS.length],
    });
  }
  return rows;
}

const ALL_MOCK_ROWS = buildMockRows(MOCK_ROW_COUNT);

export const MOCK_ORIGEM_PARTITIONS_RESPONSE: OrigemPartitionsResponse = {
  partitions: [MOCK_ORIGEM_DT],
  latest: MOCK_ORIGEM_DT,
  missing_dates: [...MOCK_MISSING_DATES],
};

export function buildMockOrigemPreview(
  dt: string,
  page = 1,
  pageSize = PREVIEW_PAGE_SIZE,
): OrigemPreviewResponse {
  const totalRows = clampPreviewTotalRows(MOCK_ROW_COUNT);
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const rows = slicePreviewPage(ALL_MOCK_ROWS, safePage, pageSize);

  return {
    dt,
    row_count: MOCK_ROW_COUNT,
    stores_count: MOCK_STORES_COUNT,
    products_count: MOCK_PRODUCTS_COUNT,
    columns: [...ORIGEM_SCHEMA_COLUMNS],
    rows,
    page: safePage,
    page_size: pageSize,
    total_pages: totalPages,
    total_rows: totalRows,
  };
}

export function isMockOrigemDt(dt: string): boolean {
  return dt.trim().slice(0, 10) === MOCK_ORIGEM_DT;
}

export { PREVIEW_MAX_ROWS, PREVIEW_PAGE_SIZE };
