from __future__ import annotations

import math
from typing import Any

import pyarrow as pa
import pyarrow.compute as pc

from app.domain.dates import add_one_day_iso, parse_iso_date


def build_d1_insight_text(
    dt: str,
    leader: dict[str, Any],
    top3_pct: float,
    total_unidades: int,
) -> str:
    if total_unidades <= 0:
        return f"Não há vendas registradas para {dt}."
    return (
        f"No dado de {dt} (D-1), o produto líder foi "
        f"{leader['product_id']} ({leader['category']}) com {leader['unidades']} un. "
        f"Os 3 primeiros concentram {round(top3_pct)}% das vendas."
    )


def aggregate_d1_from_table(table: pa.Table, dt: str, partition_exists: bool = True) -> dict[str, Any]:
    normalized_dt = parse_iso_date(dt)

    if not partition_exists or table.num_rows == 0:
        return {
            "dt": normalized_dt,
            "data_execucao": add_one_day_iso(normalized_dt),
            "partition_exists": False,
            "insight_text": f"Não há vendas registradas para {normalized_dt}.",
            "leader": {"product_id": "", "category": "", "unidades": 0, "receita": 0.0},
            "top3_concentration_pct": 0.0,
            "total_unidades": 0,
            "total_receita": 0.0,
            "ranking": [],
        }

    agg = table.group_by(["Product ID", "Category"]).aggregate(
        [("Units Sold", "sum"), ("_revenue", "sum")]
    )
    agg = agg.rename_columns(["product_id", "category", "unidades", "receita"])
    indices = pc.sort_indices(agg["unidades"], sort_keys=[("unidades", "descending"), ("receita", "descending")])
    agg = agg.take(indices)

    products = agg["product_id"].to_pylist()
    categories = agg["category"].to_pylist()
    unidades = [int(u) for u in agg["unidades"].to_pylist()]
    receitas = [round(float(r), 2) for r in agg["receita"].to_pylist()]

    total_unidades = sum(unidades)
    total_receita = round(sum(receitas), 2)

    ranking = []
    for i in range(len(products)):
        ranking.append(
            {
                "product_id": str(products[i]),
                "category": str(categories[i]),
                "unidades": unidades[i],
                "receita": receitas[i],
                "pct_total": unidades[i] / total_unidades if total_unidades else 0.0,
            }
        )

    top3_pct = (
        sum(r["unidades"] for r in ranking[:3]) / total_unidades * 100 if total_unidades else 0.0
    )
    leader = ranking[0] if ranking else {"product_id": "", "category": "", "unidades": 0, "receita": 0.0}

    return {
        "dt": normalized_dt,
        "data_execucao": add_one_day_iso(normalized_dt),
        "partition_exists": True,
        "insight_text": build_d1_insight_text(normalized_dt, leader, top3_pct, total_unidades),
        "leader": {
            "product_id": leader["product_id"],
            "category": leader["category"],
            "unidades": leader["unidades"],
            "receita": leader["receita"],
        },
        "top3_concentration_pct": top3_pct,
        "total_unidades": total_unidades,
        "total_receita": total_receita,
        "ranking": ranking,
    }
