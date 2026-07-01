from __future__ import annotations

from typing import Any

import pyarrow as pa
import pyarrow.compute as pc

from app.domain.dates import parse_iso_date


ORIGEM_COLUMNS = [
    "Date",
    "Store ID",
    "Product ID",
    "Category",
    "Region",
    "Inventory Level",
    "Units Sold",
    "Units Ordered",
    "Demand Forecast",
    "Price",
    "Discount",
    "Weather Condition",
    "Holiday/Promotion",
    "Competitor Pricing",
    "Seasonality",
]

ENRIQUECIDO_EXTRA_COLUMNS = ["_revenue", "_stockout", "_lost", "_is_weekend", "dt"]


def compute_enriquecido_kpis(table: pa.Table, dt: str) -> dict[str, Any]:
    normalized_dt = parse_iso_date(dt)
    row_count = table.num_rows
    if row_count == 0:
        return {
            "dt": normalized_dt,
            "row_count": 0,
            "revenue_total": 0.0,
            "stockout_pct": 0.0,
            "products_stockout": 0,
            "stores_count": 0,
            "stockout_count": 0,
            "lost_total": 0.0,
            "is_weekend": False,
        }

    revenue_total = round(float(pc.sum(table["_revenue"]).as_py()), 2)
    stockout_count = int(pc.sum(table["_stockout"]).as_py())
    stockout_pct = round(100.0 * stockout_count / row_count, 1)
    stores_count = len(pc.unique(table["Store ID"]).to_pylist())
    lost_total = round(float(pc.sum(table["_lost"]).as_py()), 1)

    stockout_mask = pc.equal(table["_stockout"], 1)
    stockout_table = table.filter(stockout_mask)
    products_stockout = len(pc.unique(stockout_table["Product ID"]).to_pylist()) if stockout_table.num_rows else 0

    weekend_vals = table["_is_weekend"].to_pylist()
    is_weekend = bool(weekend_vals[0]) if weekend_vals else False

    return {
        "dt": normalized_dt,
        "row_count": row_count,
        "revenue_total": revenue_total,
        "stockout_pct": stockout_pct,
        "products_stockout": products_stockout,
        "stores_count": stores_count,
        "stockout_count": stockout_count,
        "lost_total": lost_total,
        "is_weekend": is_weekend,
    }


def table_to_row_dicts(table: pa.Table, columns: list[str]) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for i in range(table.num_rows):
        row: dict[str, Any] = {}
        for col in columns:
            if col not in table.column_names:
                continue
            val = table[col][i].as_py()
            if hasattr(val, "isoformat"):
                val = val.isoformat()[:10]
            row[col] = val
        rows.append(row)
    return rows


def paginate_rows(rows: list[dict[str, Any]], page: int, page_size: int) -> tuple[list[dict[str, Any]], int, int]:
    total_rows = len(rows)
    total_pages = max(1, (total_rows + page_size - 1) // page_size)
    safe_page = min(max(1, page), total_pages)
    start = (safe_page - 1) * page_size
    end = start + page_size
    return rows[start:end], safe_page, total_pages
