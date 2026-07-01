import { aggregateD1FromEnriquecidoRows, mapEnriquecidoRowToInput } from '../d1-aggregate.util';
import { ATHENA_MAX_ROWS } from '../athena-template-params.util';
import {
  AthenaQueryParams,
  AthenaQueryTemplateResponse,
} from '../models/athena.model';
import {
  buildMockEnriquecidoKpis,
  getMockEnriquecidoRows,
  MOCK_D1_PARITY_BY_DT,
  MOCK_ENRIQ_DT_A,
} from './enriquecido-mock.data';

function mockQueryId(templateId: string): string {
  return `mock-athena-${templateId}-${Date.now()}`;
}

function truncateRows<T extends Record<string, string | number | null>>(
  rows: T[],
  limit: number,
): { rows: T[]; truncated: boolean } {
  if (rows.length <= limit) {
    return { rows, truncated: false };
  }
  return { rows: rows.slice(0, limit), truncated: true };
}

function baseResponse(
  templateId: string,
  columns: string[],
  rows: Record<string, string | number | null>[],
  truncated: boolean,
): AthenaQueryTemplateResponse {
  return {
    query_execution_id: mockQueryId(templateId),
    template_id: templateId,
    status: 'SUCCEEDED',
    columns,
    rows,
    row_count: rows.length,
    truncated,
    execution_time_ms: 120,
    data_scan_bytes: 4096,
  };
}

function buildSmokePreview(dt: string): AthenaQueryTemplateResponse {
  const rows = getMockEnriquecidoRows(dt).slice(0, 5).map((row) => ({
    'Store ID': String(row['Store ID'] ?? ''),
    'Product ID': String(row['Product ID'] ?? ''),
    '_revenue': Number(row['_revenue'] ?? 0),
    '_stockout': Number(row['_stockout'] ?? 0),
    '_lost': Number(row['_lost'] ?? 0),
    dt: String(row['dt'] ?? dt),
  }));
  return baseResponse('smoke_preview', Object.keys(rows[0] ?? {}), rows, false);
}

function buildPartitionSanity(dt: string): AthenaQueryTemplateResponse {
  const rows_data = getMockEnriquecidoRows(dt);
  const kpis = buildMockEnriquecidoKpis(dt);
  const stores = new Set(rows_data.map((r) => String(r['Store ID'])));
  const products = new Set(rows_data.map((r) => String(r['Product ID'])));
  const stockouts = rows_data.reduce((s, r) => s + Number(r['_stockout'] ?? 0), 0);
  const rows = [
    {
      dt,
      linhas: kpis.row_count,
      lojas: stores.size || kpis.stores_count,
      produtos: products.size,
      receita_total: Number(kpis.revenue_total.toFixed(2)),
      qtd_stockout: stockouts,
      pct_stockout: Number(kpis.stockout_pct.toFixed(1)),
    },
  ];
  return baseResponse(
    'partition_sanity',
    ['dt', 'linhas', 'lojas', 'produtos', 'receita_total', 'qtd_stockout', 'pct_stockout'],
    rows,
    false,
  );
}

function buildEnrichedNullCheck(dt: string): AthenaQueryTemplateResponse {
  const rows = [
    {
      dt,
      revenue_nulos: 0,
      stockout_nulos: 0,
      lost_nulos: 0,
      weekend_nulos: 0,
    },
  ];
  return baseResponse(
    'enriched_null_check',
    ['dt', 'revenue_nulos', 'stockout_nulos', 'lost_nulos', 'weekend_nulos'],
    rows,
    false,
  );
}

function buildD1TopProducts(dt: string, limit: number): AthenaQueryTemplateResponse {
  const inputs = getMockEnriquecidoRows(dt).map(mapEnriquecidoRowToInput);
  const d1 = aggregateD1FromEnriquecidoRows(inputs, dt);
  const { rows, truncated } = truncateRows(
    d1.ranking.slice(0, limit).map((r) => ({
      'Product ID': r.product_id,
      Category: r.category,
      unidades: r.unidades,
      receita: r.receita,
    })),
    ATHENA_MAX_ROWS,
  );
  return baseResponse(
    'd1_top_products',
    ['Product ID', 'Category', 'unidades', 'receita'],
    rows,
    truncated,
  );
}

function buildD1Totals(dt: string): AthenaQueryTemplateResponse {
  const normalized = dt.trim().slice(0, 10);
  const parity = MOCK_D1_PARITY_BY_DT[normalized];
  if (parity) {
    const rows = [parity];
    return baseResponse(
      'd1_totals',
      ['produtos_distintos', 'total_unidades', 'total_receita'],
      rows,
      false,
    );
  }

  const inputs = getMockEnriquecidoRows(dt).map(mapEnriquecidoRowToInput);
  const d1 = aggregateD1FromEnriquecidoRows(inputs, dt);
  const rows = [
    {
      produtos_distintos: new Set(inputs.map((r) => r.productId)).size,
      total_unidades: d1.total_unidades,
      total_receita: d1.total_receita,
    },
  ];
  return baseResponse(
    'd1_totals',
    ['produtos_distintos', 'total_unidades', 'total_receita'],
    rows,
    false,
  );
}

function buildD2Stockouts(dt: string): AthenaQueryTemplateResponse {
  const rows = getMockEnriquecidoRows(dt)
    .filter((r) => Number(r['_stockout']) === 1 && Number(r['_lost']) > 0)
    .map((r) => ({
      'Store ID': String(r['Store ID']),
      'Product ID': String(r['Product ID']),
      Category: String(r['Category']),
      venda_perdida: Number(r['_lost']),
    }));
  const { rows: limited, truncated } = truncateRows(rows, ATHENA_MAX_ROWS);
  return baseResponse(
    'd2_stockouts',
    ['Store ID', 'Product ID', 'Category', 'venda_perdida'],
    limited,
    truncated,
  );
}

function buildD2TopLost(dt: string, limit: number): AthenaQueryTemplateResponse {
  const buckets = new Map<string, number>();
  for (const row of getMockEnriquecidoRows(dt)) {
    if (Number(row['_stockout']) !== 1) {
      continue;
    }
    const key = `${row['Store ID']}\0${row['Product ID']}`;
    buckets.set(key, (buckets.get(key) ?? 0) + Number(row['_lost'] ?? 0));
  }
  const sorted = [...buckets.entries()]
    .map(([key, lost_total]) => {
      const [storeId, productId] = key.split('\0');
      return { 'Store ID': storeId, 'Product ID': productId, lost_total: Number(lost_total.toFixed(2)) };
    })
    .sort((a, b) => b.lost_total - a.lost_total);
  const { rows, truncated } = truncateRows(sorted.slice(0, limit), ATHENA_MAX_ROWS);
  return baseResponse('d2_top_lost', ['Store ID', 'Product ID', 'lost_total'], rows, truncated);
}

function buildD3WeekendTrend(dts: string[], limit: number): AthenaQueryTemplateResponse {
  const buckets = new Map<
    string,
    { weekday: number[]; weekend: number[]; weekdayN: number; weekendN: number }
  >();

  for (const dt of dts) {
    for (const row of getMockEnriquecidoRows(dt)) {
      const key = `${row['Store ID']}\0${row['Product ID']}`;
      const entry = buckets.get(key) ?? { weekday: [], weekend: [], weekdayN: 0, weekendN: 0 };
      const units = Number(row['Units Sold'] ?? 0);
      if (Number(row['_is_weekend']) === 1) {
        entry.weekend.push(units);
        entry.weekendN += 1;
      } else {
        entry.weekday.push(units);
        entry.weekdayN += 1;
      }
      buckets.set(key, entry);
    }
  }

  const avg = (values: number[]) =>
    values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null;

  const rows = [...buckets.entries()]
    .map(([key, entry]) => {
      const [storeId, productId] = key.split('\0');
      return {
        'Store ID': storeId,
        'Product ID': productId,
        media_uteis: avg(entry.weekday) !== null ? Number(avg(entry.weekday)!.toFixed(2)) : null,
        media_fds: avg(entry.weekend) !== null ? Number(avg(entry.weekend)!.toFixed(2)) : null,
        dias_na_janela: dts.length,
      };
    })
    .sort((a, b) => (b.media_uteis ?? 0) - (a.media_uteis ?? 0));

  const { rows: limited, truncated } = truncateRows(rows.slice(0, limit), ATHENA_MAX_ROWS);
  return baseResponse(
    'd3_weekend_trend',
    ['Store ID', 'Product ID', 'media_uteis', 'media_fds', 'dias_na_janela'],
    limited,
    truncated,
  );
}

function buildMultiDtCoverage(dts: string[]): AthenaQueryTemplateResponse {
  const rows = dts.map((dt) => {
    const kpis = buildMockEnriquecidoKpis(dt);
    return {
      dt,
      linhas: kpis.row_count,
      receita: Number(kpis.revenue_total.toFixed(2)),
    };
  });
  return baseResponse('multi_dt_coverage', ['dt', 'linhas', 'receita'], rows, false);
}

export function buildMockAthenaQueryResponse(
  templateId: string,
  params: AthenaQueryParams,
): AthenaQueryTemplateResponse {
  const dt = params.dt ?? MOCK_ENRIQ_DT_A;
  const dts = params.dts ?? [MOCK_ENRIQ_DT_A];
  const limit = params.limit ?? 10;

  switch (templateId) {
    case 'smoke_preview':
      return buildSmokePreview(dt);
    case 'partition_sanity':
      return buildPartitionSanity(dt);
    case 'enriched_null_check':
      return buildEnrichedNullCheck(dt);
    case 'd1_top_products':
      return buildD1TopProducts(dt, limit);
    case 'd1_totals':
      return buildD1Totals(dt);
    case 'd2_stockouts':
      return buildD2Stockouts(dt);
    case 'd2_top_lost':
      return buildD2TopLost(dt, limit);
    case 'd3_weekend_trend':
      return buildD3WeekendTrend(dts, limit);
    case 'multi_dt_coverage':
      return buildMultiDtCoverage(dts);
    default:
      return {
        query_execution_id: mockQueryId('unknown'),
        template_id: templateId,
        status: 'FAILED',
        columns: [],
        rows: [],
        row_count: 0,
        truncated: false,
        state_reason: 'Template não suportado no mock.',
      };
  }
}
