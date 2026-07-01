"""Athena template whitelist and SQL builders."""

from __future__ import annotations

import re
from typing import Any

from app.domain.dates import parse_iso_date
from app.errors import PortalApiError

ALLOWED_TEMPLATES = frozenset(
    {
        "smoke_preview",
        "partition_sanity",
        "enriched_null_check",
        "d1_top_products",
        "d1_totals",
        "d2_stockouts",
        "d2_top_lost",
        "d3_weekend_trend",
        "multi_dt_coverage",
    }
)


def validate_template_params(template_id: str, params: dict[str, Any]) -> dict[str, Any]:
    if template_id not in ALLOWED_TEMPLATES:
        raise PortalApiError(400, "UNKNOWN_TEMPLATE", f"Template não encontrado: {template_id}")

    normalized: dict[str, Any] = {}
    if template_id in {"d3_weekend_trend", "multi_dt_coverage"}:
        dts = params.get("dts") or []
        if not isinstance(dts, list) or len(dts) < 2:
            raise PortalApiError(400, "INVALID_PARAMS", "Informe ao menos 2 datas em dts.")
        normalized["dts"] = [parse_iso_date(d) for d in dts[:7]]
    else:
        dt = params.get("dt")
        if not dt:
            raise PortalApiError(400, "INVALID_PARAMS", "Parâmetro dt é obrigatório.")
        normalized["dt"] = parse_iso_date(dt)

    limit = int(params.get("limit") or 10)
    normalized["limit"] = min(max(1, limit), 100)
    return normalized


def build_sql(database: str, template_id: str, params: dict[str, Any]) -> str:
    db = database
    p = validate_template_params(template_id, params)

    if template_id == "smoke_preview":
        dt = p["dt"]
        return f"""SELECT "Store ID", "Product ID", "_revenue", "_stockout", "_lost", dt
FROM {db}.enriquecido WHERE dt = '{dt}' LIMIT 5"""

    if template_id == "partition_sanity":
        dt = p["dt"]
        return f"""SELECT dt, COUNT(*) AS linhas,
  COUNT(DISTINCT "Store ID") AS lojas,
  COUNT(DISTINCT "Product ID") AS produtos,
  ROUND(SUM("_revenue"), 2) AS receita_total,
  SUM("_stockout") AS qtd_stockout,
  ROUND(AVG("_stockout") * 100, 1) AS pct_stockout
FROM {db}.enriquecido WHERE dt = '{dt}' GROUP BY dt"""

    if template_id == "enriched_null_check":
        dt = p["dt"]
        return f"""SELECT dt,
  SUM(CASE WHEN "_revenue" IS NULL THEN 1 ELSE 0 END) AS revenue_nulos,
  SUM(CASE WHEN "_stockout" IS NULL THEN 1 ELSE 0 END) AS stockout_nulos,
  SUM(CASE WHEN "_lost" IS NULL THEN 1 ELSE 0 END) AS lost_nulos,
  SUM(CASE WHEN "_is_weekend" IS NULL THEN 1 ELSE 0 END) AS weekend_nulos
FROM {db}.enriquecido WHERE dt = '{dt}' GROUP BY dt"""

    if template_id == "d1_top_products":
        dt, limit = p["dt"], p["limit"]
        return f"""SELECT "Product ID", "Category",
  SUM("Units Sold") AS unidades, ROUND(SUM("_revenue"), 2) AS receita
FROM {db}.enriquecido WHERE dt = '{dt}'
GROUP BY 1, 2 ORDER BY unidades DESC LIMIT {limit}"""

    if template_id == "d1_totals":
        dt = p["dt"]
        return f"""SELECT COUNT(DISTINCT "Product ID") AS produtos_distintos,
  SUM("Units Sold") AS total_unidades,
  ROUND(SUM("_revenue"), 2) AS total_receita
FROM {db}.enriquecido WHERE dt = '{dt}'"""

    if template_id == "d2_stockouts":
        dt = p["dt"]
        return f"""SELECT "Store ID", "Product ID", "Category", "_lost" AS venda_perdida
FROM {db}.enriquecido
WHERE dt = '{dt}' AND "_stockout" = 1 AND "_lost" > 0
ORDER BY venda_perdida DESC LIMIT 100"""

    if template_id == "d2_top_lost":
        dt, limit = p["dt"], p["limit"]
        return f"""SELECT "Store ID", "Product ID", ROUND(SUM("_lost"), 2) AS lost_total
FROM {db}.enriquecido
WHERE dt = '{dt}' AND "_stockout" = 1
GROUP BY 1, 2 ORDER BY lost_total DESC LIMIT {limit}"""

    if template_id == "multi_dt_coverage":
        in_list = ", ".join(f"'{d}'" for d in p["dts"])
        return f"""SELECT dt, COUNT(*) AS linhas, ROUND(SUM("_revenue"), 2) AS receita
FROM {db}.enriquecido WHERE dt IN ({in_list}) GROUP BY dt ORDER BY dt"""

    if template_id == "d3_weekend_trend":
        in_list = ", ".join(f"'{d}'" for d in p["dts"])
        limit = p["limit"]
        return f"""SELECT "Store ID", "Product ID",
  ROUND(AVG(CASE WHEN "_is_weekend" = 0 THEN "Units Sold" END), 2) AS media_uteis,
  ROUND(AVG(CASE WHEN "_is_weekend" = 1 THEN "Units Sold" END), 2) AS media_fds,
  {len(p['dts'])} AS dias_na_janela
FROM {db}.enriquecido WHERE dt IN ({in_list})
GROUP BY 1, 2 ORDER BY media_uteis DESC NULLS LAST LIMIT {limit}"""

    raise PortalApiError(400, "UNKNOWN_TEMPLATE", f"Template não suportado: {template_id}")
