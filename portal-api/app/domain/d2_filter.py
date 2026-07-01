from __future__ import annotations

from typing import Any

import pyarrow as pa
import pyarrow.compute as pc

from app.domain.dates import add_one_day_iso, parse_iso_date


def build_d2_insight_text(
    dt: str,
    rupturas_count: int,
    total_lost: float,
    top_impact: dict[str, Any] | None,
) -> str:
    if rupturas_count == 0:
        return f"No dado de {dt}, nenhuma ruptura com venda perdida."
    top = top_impact or {}
    return (
        f"No dado de {dt}, {rupturas_count} rupturas com venda perdida (total {total_lost:.1f} un.). "
        f"Maior impacto: loja {top.get('store_id', '')}, produto {top.get('product_id', '')} "
        f"({top.get('lost', 0):.1f} un. perdidas)."
    )


def filter_rupturas_from_table(table: pa.Table, dt: str, partition_exists: bool = True) -> dict[str, Any]:
    normalized_dt = parse_iso_date(dt)

    if not partition_exists or table.num_rows == 0:
        return {
            "dt": normalized_dt,
            "data_execucao": add_one_day_iso(normalized_dt),
            "partition_exists": False,
            "insight_text": build_d2_insight_text(normalized_dt, 0, 0.0, None),
            "rupturas_count": 0,
            "total_lost": 0.0,
            "top_impact": None,
            "rows": [],
        }

    mask = pc.and_(pc.equal(table["_stockout"], 1), pc.greater(table["_lost"], 0))
    filtered = table.filter(mask)
    if filtered.num_rows > 0:
        indices = pc.sort_indices(filtered["_lost"], sort_keys=[("_lost", "descending")])
        filtered = filtered.take(indices)

    rows = []
    for i in range(filtered.num_rows):
        rows.append(
            {
                "store_id": str(filtered["Store ID"][i].as_py()),
                "product_id": str(filtered["Product ID"][i].as_py()),
                "category": str(filtered["Category"][i].as_py()),
                "inventory_level": int(filtered["Inventory Level"][i].as_py()),
                "units_sold": int(filtered["Units Sold"][i].as_py()),
                "demand_forecast": int(filtered["Demand Forecast"][i].as_py()),
                "lost": round(float(filtered["_lost"][i].as_py()), 1),
            }
        )

    total_lost = round(sum(r["lost"] for r in rows), 1)
    top_impact = (
        {"store_id": rows[0]["store_id"], "product_id": rows[0]["product_id"], "lost": rows[0]["lost"]}
        if rows
        else None
    )

    return {
        "dt": normalized_dt,
        "data_execucao": add_one_day_iso(normalized_dt),
        "partition_exists": True,
        "insight_text": build_d2_insight_text(normalized_dt, len(rows), total_lost, top_impact),
        "rupturas_count": len(rows),
        "total_lost": total_lost,
        "top_impact": top_impact,
        "rows": rows,
    }
