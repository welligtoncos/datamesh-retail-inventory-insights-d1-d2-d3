from __future__ import annotations

from datetime import date, timedelta
from typing import Any

from app.domain.dates import add_one_day_iso, parse_iso_date


def insight_date_range(end_date: str, window_days: int) -> list[str]:
    end = date.fromisoformat(parse_iso_date(end_date))
    start = end - timedelta(days=window_days - 1)
    days: list[str] = []
    cur = start
    while cur <= end:
        days.append(cur.isoformat())
        cur += timedelta(days=1)
    return days


def classify_trend(trend_pct: float) -> str:
    if trend_pct > 5:
        return "Subindo"
    if trend_pct < -5:
        return "Caindo"
    return "Estável"


def build_d3_insight_text(
    partitions_read: int,
    subindo: int,
    caindo: int,
    top_trend: dict[str, Any] | None,
) -> str:
    insight = (
        f"Janela de {partitions_read} dia(s): {subindo} pares loja×produto em alta, "
        f"{caindo} em queda (limiar ±5%). "
    )
    if top_trend:
        sign = "+" if top_trend["trend_pct"] >= 0 else ""
        insight += (
            f"Maior variação: {top_trend['store_id']}/{top_trend['product_id']} "
            f"({sign}{top_trend['trend_pct']:.1f}%, {top_trend['trend_label']})."
        )
    return insight.strip()


def compute_trends_from_table(table, dt: str, window_days: int, partition_exists: bool) -> dict[str, Any]:
    normalized_dt = parse_iso_date(dt)

    if not partition_exists or table.num_rows == 0:
        return {
            "dt": normalized_dt,
            "data_execucao": add_one_day_iso(normalized_dt),
            "window_days": window_days,
            "partitions_read": 0,
            "partition_exists": partition_exists,
            "insight_text": (
                "Nenhuma partição enriquecida encontrada na janela selecionada."
                if partition_exists
                else build_d3_insight_text(0, 0, 0, None)
            ),
            "subindo_count": 0,
            "caindo_count": 0,
            "estavel_count": 0,
            "top_trend": None,
            "rows": [],
        }

    acc: dict[str, dict[str, Any]] = {}

    for i in range(table.num_rows):
        store = str(table["Store ID"][i].as_py())
        product = str(table["Product ID"][i].as_py())
        key = f"{store}\0{product}"
        units = int(table["Units Sold"][i].as_py())
        weekend = int(table["_is_weekend"][i].as_py())
        row_dt = str(table["dt"][i].as_py())[:10]
        category = str(table["Category"][i].as_py())

        if key not in acc:
            acc[key] = {
                "category": category,
                "weekday_units": [],
                "weekend_units": [],
                "by_dt": {},
            }
        bucket = acc[key]
        bucket["category"] = category
        bucket["by_dt"][row_dt] = bucket["by_dt"].get(row_dt, 0) + units
        if weekend == 1:
            bucket["weekend_units"].append(units)
        else:
            bucket["weekday_units"].append(units)

    partitions_read = len({str(table["dt"][i].as_py())[:10] for i in range(table.num_rows)})
    trend_rows: list[dict[str, Any]] = []

    for key, data in acc.items():
        store_id, product_id = key.split("\0")
        avg_weekday = (
            sum(data["weekday_units"]) / len(data["weekday_units"]) if data["weekday_units"] else 0.0
        )
        avg_weekend = (
            sum(data["weekend_units"]) / len(data["weekend_units"]) if data["weekend_units"] else 0.0
        )
        sorted_dts = sorted(data["by_dt"].keys())
        trend_pct = 0.0
        if len(sorted_dts) >= 2:
            mid = len(sorted_dts) // 2
            first_half = sorted_dts[:mid]
            second_half = sorted_dts[mid:]
            h1 = sum(data["by_dt"][d] for d in first_half)
            h2 = sum(data["by_dt"][d] for d in second_half)
            trend_pct = ((h2 - h1) / h1) * 100 if h1 > 0 else (100.0 if h2 > 0 else 0.0)

        trend_label = classify_trend(trend_pct)
        trend_rows.append(
            {
                "store_id": store_id,
                "product_id": product_id,
                "category": data["category"],
                "avg_weekday": round(avg_weekday, 1),
                "avg_weekend": round(avg_weekend, 1),
                "trend_pct": round(trend_pct, 1),
                "trend_label": trend_label,
                "dias": len(sorted_dts),
            }
        )

    trend_rows.sort(key=lambda r: abs(r["trend_pct"]), reverse=True)
    subindo_count = sum(1 for r in trend_rows if r["trend_label"] == "Subindo")
    caindo_count = sum(1 for r in trend_rows if r["trend_label"] == "Caindo")
    estavel_count = sum(1 for r in trend_rows if r["trend_label"] == "Estável")
    top_trend = (
        {
            "store_id": trend_rows[0]["store_id"],
            "product_id": trend_rows[0]["product_id"],
            "trend_pct": trend_rows[0]["trend_pct"],
            "trend_label": trend_rows[0]["trend_label"],
        }
        if trend_rows
        else None
    )

    return {
        "dt": normalized_dt,
        "data_execucao": add_one_day_iso(normalized_dt),
        "window_days": window_days,
        "partitions_read": partitions_read,
        "partition_exists": True,
        "insight_text": build_d3_insight_text(partitions_read, subindo_count, caindo_count, top_trend),
        "subindo_count": subindo_count,
        "caindo_count": caindo_count,
        "estavel_count": estavel_count,
        "top_trend": top_trend,
        "rows": trend_rows,
    }
