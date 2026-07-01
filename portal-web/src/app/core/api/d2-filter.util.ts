import { addOneDayIso } from './d1-date.util';
import {
  D2RupturaRow,
  D2TopImpact,
  InsightsD2Response,
} from './models/insights-d2.model';

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
): EnriquecidoRupturaInput {
  return {
    storeId: String(row['Store ID'] ?? ''),
    productId: String(row['Product ID'] ?? ''),
    category: String(row['Category'] ?? ''),
    inventoryLevel: Number(row['Inventory Level'] ?? 0),
    unitsSold: Number(row['Units Sold'] ?? 0),
    demandForecast: Number(row['Demand Forecast'] ?? 0),
    stockout: Number(row['_stockout'] ?? 0),
    lost: Number(row['_lost'] ?? 0),
  };
}

export function buildD2InsightText(
  dt: string,
  rupturasCount: number,
  totalLost: number,
  topImpact: D2TopImpact | null,
): string {
  if (rupturasCount === 0) {
    return `No dado de ${dt}, nenhuma ruptura com venda perdida.`;
  }

  const top = topImpact!;
  return (
    `No dado de ${dt}, ${rupturasCount} rupturas com venda perdida (total ${totalLost.toFixed(1)} un.). ` +
    `Maior impacto: loja ${top.store_id}, produto ${top.product_id} (${top.lost.toFixed(1)} un. perdidas).`
  );
}

export function filterRupturasFromRows(
  inputs: EnriquecidoRupturaInput[],
  dt: string,
  partitionExists: boolean,
): InsightsD2Response {
  const normalizedDt = dt.trim().slice(0, 10);

  if (!partitionExists) {
    return {
      dt: normalizedDt,
      data_execucao: addOneDayIso(normalizedDt),
      partition_exists: false,
      insight_text: buildD2InsightText(normalizedDt, 0, 0, null),
      rupturas_count: 0,
      total_lost: 0,
      top_impact: null,
      rows: [],
    };
  }

  const filtered = inputs
    .filter((row) => row.stockout === 1 && row.lost > 0)
    .sort((a, b) => b.lost - a.lost);

  const rows: D2RupturaRow[] = filtered.map((row) => ({
    store_id: row.storeId,
    product_id: row.productId,
    category: row.category,
    inventory_level: row.inventoryLevel,
    units_sold: row.unitsSold,
    demand_forecast: row.demandForecast,
    lost: Number(row.lost.toFixed(1)),
  }));

  const total_lost = Number(rows.reduce((sum, row) => sum + row.lost, 0).toFixed(1));
  const top_impact: D2TopImpact | null = rows[0]
    ? {
        store_id: rows[0].store_id,
        product_id: rows[0].product_id,
        lost: rows[0].lost,
      }
    : null;

  return {
    dt: normalizedDt,
    data_execucao: addOneDayIso(normalizedDt),
    partition_exists: true,
    insight_text: buildD2InsightText(normalizedDt, rows.length, total_lost, top_impact),
    rupturas_count: rows.length,
    total_lost,
    top_impact,
    rows,
  };
}
