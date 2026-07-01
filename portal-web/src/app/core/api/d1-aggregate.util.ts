import { addOneDayIso } from './d1-date.util';
import {
  D1Leader,
  D1RankingRow,
  InsightsD1Response,
} from './models/insights-d1.model';

export interface EnriquecidoRowInput {
  productId: string;
  category: string;
  unitsSold: number;
  revenue: number;
}

export function mapEnriquecidoRowToInput(row: Record<string, unknown>): EnriquecidoRowInput {
  return {
    productId: String(row['Product ID'] ?? ''),
    category: String(row['Category'] ?? ''),
    unitsSold: Number(row['Units Sold'] ?? 0),
    revenue: Number(row['_revenue'] ?? 0),
  };
}

export function buildD1InsightText(
  dt: string,
  leader: D1Leader,
  top3Pct: number,
  totalUnidades: number,
): string {
  if (totalUnidades <= 0) {
    return `Não há vendas registradas para ${dt}.`;
  }

  return (
    `No dado de ${dt} (D-1), o produto líder foi ` +
    `${leader.product_id} (${leader.category}) com ${leader.unidades} un. ` +
    `Os 3 primeiros concentram ${Math.round(top3Pct)}% das vendas.`
  );
}

export function aggregateD1FromEnriquecidoRows(
  rows: EnriquecidoRowInput[],
  dt: string,
  partitionExists = true,
): InsightsD1Response {
  const normalizedDt = dt.trim().slice(0, 10);
  const buckets = new Map<
    string,
    { product_id: string; category: string; unidades: number; receita: number }
  >();

  for (const row of rows) {
    const key = `${row.productId}\0${row.category}`;
    const current = buckets.get(key);
    if (current) {
      current.unidades += row.unitsSold;
      current.receita += row.revenue;
    } else {
      buckets.set(key, {
        product_id: row.productId,
        category: row.category,
        unidades: row.unitsSold,
        receita: row.revenue,
      });
    }
  }

  let ranking: D1RankingRow[] = Array.from(buckets.values()).map((entry) => ({
    product_id: entry.product_id,
    category: entry.category,
    unidades: entry.unidades,
    receita: Number(entry.receita.toFixed(2)),
    pct_total: 0,
  }));

  ranking.sort((a, b) => {
    if (b.unidades !== a.unidades) {
      return b.unidades - a.unidades;
    }
    return b.receita - a.receita;
  });

  const total_unidades = ranking.reduce((sum, row) => sum + row.unidades, 0);
  const total_receita = Number(
    ranking.reduce((sum, row) => sum + row.receita, 0).toFixed(2),
  );

  ranking = ranking.map((row) => ({
    ...row,
    pct_total: total_unidades > 0 ? row.unidades / total_unidades : 0,
  }));

  const top3_concentration_pct =
    total_unidades > 0
      ? (ranking.slice(0, 3).reduce((sum, row) => sum + row.unidades, 0) / total_unidades) *
        100
      : 0;

  const leaderRow = ranking[0] ?? {
    product_id: '',
    category: '',
    unidades: 0,
    receita: 0,
    pct_total: 0,
  };

  const leader: D1Leader = {
    product_id: leaderRow.product_id,
    category: leaderRow.category,
    unidades: leaderRow.unidades,
    receita: leaderRow.receita,
  };

  return {
    dt: normalizedDt,
    data_execucao: addOneDayIso(normalizedDt),
    partition_exists: partitionExists,
    insight_text: buildD1InsightText(
      normalizedDt,
      leader,
      top3_concentration_pct,
      total_unidades,
    ),
    leader,
    top3_concentration_pct,
    total_unidades,
    total_receita,
    ranking,
  };
}
