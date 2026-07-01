import { addOneDayIso, normalizeD1Dt } from './d1-date.util';
import {
  D3TopTrend,
  D3TrendRow,
  InsightsD3Response,
  TrendLabel,
} from './models/insights-d3.model';

export const DEFAULT_D3_WINDOW = 7;
export const D3_WINDOW_OPTIONS = [3, 7, 14] as const;

export function insightDateRange(endDate: string, windowDays: number): string[] {
  const end = new Date(`${normalizeD1Dt(endDate)}T12:00:00`);
  const start = new Date(end);
  start.setDate(start.getDate() - (windowDays - 1));

  const days: string[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    days.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

function classifyTrend(trendPct: number): TrendLabel {
  if (trendPct > 5) {
    return 'Subindo';
  }
  if (trendPct < -5) {
    return 'Caindo';
  }
  return 'Estável';
}

export function buildD3InsightText(
  partitionsRead: number,
  subindo: number,
  caindo: number,
  topTrend: D3TopTrend | null,
): string {
  let insight =
    `Janela de ${partitionsRead} dia(s): ${subindo} pares loja×produto em alta, ` +
    `${caindo} em queda (limiar ±5%). `;

  if (topTrend) {
    insight +=
      `Maior variação: ${topTrend.store_id}/${topTrend.product_id} ` +
      `(${topTrend.trend_pct >= 0 ? '+' : ''}${topTrend.trend_pct.toFixed(1)}%, ${topTrend.trend_label}).`;
  }

  return insight.trim();
}

export function computeTrendsFromEnrichedRows(
  allRows: Record<string, unknown>[],
  dt: string,
  windowDays: number,
  partitionExists: boolean,
): InsightsD3Response {
  const normalizedDt = normalizeD1Dt(dt);

  if (!partitionExists || allRows.length === 0) {
    return {
      dt: normalizedDt,
      data_execucao: addOneDayIso(normalizedDt),
      window_days: windowDays,
      partitions_read: 0,
      partition_exists: partitionExists,
      insight_text: partitionExists
        ? 'Nenhuma partição enriquecida encontrada na janela selecionada.'
        : buildD3InsightText(0, 0, 0, null),
      subindo_count: 0,
      caindo_count: 0,
      estavel_count: 0,
      top_trend: null,
      rows: [],
    };
  }

  type Acc = {
    category: string;
    weekdayUnits: number[];
    weekendUnits: number[];
    byDt: Map<string, number>;
  };

  const acc = new Map<string, Acc>();

  for (const row of allRows) {
    const store = String(row['Store ID'] ?? '');
    const product = String(row['Product ID'] ?? '');
    const key = `${store}\0${product}`;
    const units = Number(row['Units Sold'] ?? 0);
    const weekend = Number(row['_is_weekend'] ?? 0);
    const rowDt = String(row['dt'] ?? row['Date'] ?? normalizedDt).slice(0, 10);

    if (!acc.has(key)) {
      acc.set(key, { category: String(row['Category'] ?? ''), weekdayUnits: [], weekendUnits: [], byDt: new Map() });
    }
    const bucket = acc.get(key)!;
    bucket.category = String(row['Category'] ?? bucket.category);
    bucket.byDt.set(rowDt, (bucket.byDt.get(rowDt) ?? 0) + units);
    if (weekend === 1) {
      bucket.weekendUnits.push(units);
    } else {
      bucket.weekdayUnits.push(units);
    }
  }

  const partitionsRead = new Set(
    allRows.map((row) => String(row['dt'] ?? row['Date'] ?? '').slice(0, 10)),
  ).size;

  const trendRows: D3TrendRow[] = [];

  for (const [key, data] of acc.entries()) {
    const [store_id, product_id] = key.split('\0');
    const avg_weekday =
      data.weekdayUnits.length > 0
        ? data.weekdayUnits.reduce((a, b) => a + b, 0) / data.weekdayUnits.length
        : 0;
    const avg_weekend =
      data.weekendUnits.length > 0
        ? data.weekendUnits.reduce((a, b) => a + b, 0) / data.weekendUnits.length
        : 0;

    const sortedDts = [...data.byDt.keys()].sort();
    let trend_pct = 0;
    if (sortedDts.length >= 2) {
      const mid = Math.floor(sortedDts.length / 2);
      const firstHalf = sortedDts.slice(0, mid);
      const secondHalf = sortedDts.slice(mid);
      const h1 = firstHalf.reduce((sum, d) => sum + (data.byDt.get(d) ?? 0), 0);
      const h2 = secondHalf.reduce((sum, d) => sum + (data.byDt.get(d) ?? 0), 0);
      trend_pct = h1 > 0 ? ((h2 - h1) / h1) * 100 : h2 > 0 ? 100 : 0;
    }

    const trend_label = classifyTrend(trend_pct);
    trendRows.push({
      store_id,
      product_id,
      category: data.category,
      avg_weekday: Number(avg_weekday.toFixed(1)),
      avg_weekend: Number(avg_weekend.toFixed(1)),
      trend_pct: Number(trend_pct.toFixed(1)),
      trend_label,
      dias: sortedDts.length,
    });
  }

  trendRows.sort((a, b) => Math.abs(b.trend_pct) - Math.abs(a.trend_pct));

  const subindo_count = trendRows.filter((r) => r.trend_label === 'Subindo').length;
  const caindo_count = trendRows.filter((r) => r.trend_label === 'Caindo').length;
  const estavel_count = trendRows.filter((r) => r.trend_label === 'Estável').length;

  const top_trend: D3TopTrend | null = trendRows[0]
    ? {
        store_id: trendRows[0].store_id,
        product_id: trendRows[0].product_id,
        trend_pct: trendRows[0].trend_pct,
        trend_label: trendRows[0].trend_label,
      }
    : null;

  return {
    dt: normalizedDt,
    data_execucao: addOneDayIso(normalizedDt),
    window_days: windowDays,
    partitions_read: partitionsRead,
    partition_exists: true,
    insight_text: buildD3InsightText(partitionsRead, subindo_count, caindo_count, top_trend),
    subindo_count,
    caindo_count,
    estavel_count,
    top_trend,
    rows: trendRows,
  };
}
