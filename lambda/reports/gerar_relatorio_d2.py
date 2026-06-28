"""
Lambda · relatório Excel D-2 (reposição / rupturas)
Brownfield: PROJETO_DATAMESH.txt §7 — _stockout=1 e _lost>0
"""
from __future__ import annotations

import json
from typing import Any

import boto3
import pyarrow as pa
import pyarrow.compute as pc

from common import (
    get_bucket,
    read_parquet_s3,
    resolve_dates,
    upload_workbook,
    workbook_to_bytes,
)
from excel_helpers import _cell, _header, _insight, _title

RED = "DC2626"
LT = "FEE2E2"


def filter_rupturas(table: pa.Table) -> pa.Table:
    mask = pc.and_(
        pc.equal(table["_stockout"], 1),
        pc.greater(table["_lost"], 0),
    )
    filtered = table.filter(mask)
    if filtered.num_rows == 0:
        return filtered
    indices = pc.sort_indices(filtered["_lost"], sort_keys=[("_lost", "descending")])
    return filtered.take(indices)


def build_workbook(
    rows: pa.Table, data_execucao: str, dia_dado: str
) -> tuple[Any, dict[str, Any]]:
    wb = __import__("openpyxl").Workbook()
    ws = wb.active
    ws.title = "D2_Reposicao"

    n = rows.num_rows
    if n == 0:
        _title(
            ws,
            "Relatório D-2 · Reposição Necessária",
            f"Execução {data_execucao} | dado: {dia_dado} | gerado pela esteira",
            7,
            RED,
        )
        _insight(ws, f"No dado de {dia_dado}, nenhuma ruptura com venda perdida.", 7, LT)
        return wb, {"rupturas": 0, "total_lost": 0.0}

    stores = rows["Store ID"].to_pylist()
    products = rows["Product ID"].to_pylist()
    categories = rows["Category"].to_pylist()
    inv = rows["Inventory Level"].to_pylist()
    sold = rows["Units Sold"].to_pylist()
    forecast = rows["Demand Forecast"].to_pylist()
    lost = rows["_lost"].to_pylist()

    total_lost = float(sum(lost))
    top_lost = float(lost[0])
    top_store = str(stores[0])
    top_prod = str(products[0])

    _title(
        ws,
        "Relatório D-2 · Reposição Necessária",
        f"Execução {data_execucao} | dado: {dia_dado} | gerado pela esteira",
        7,
        RED,
    )
    _insight(
        ws,
        f"No dado de {dia_dado}, {n} rupturas com venda perdida (total {total_lost:.1f} un.). "
        f"Maior impacto: loja {top_store}, produto {top_prod} ({top_lost:.1f} un. perdidas).",
        7,
        LT,
    )
    _header(
        ws,
        6,
        [
            "Loja",
            "Produto",
            "Categoria",
            "Estoque",
            "Vendido",
            "Forecast",
            "Venda Perdida",
        ],
        RED,
    )

    r0 = 7
    for i in range(n):
        r = r0 + i
        _cell(ws, r, 1, stores[i])
        _cell(ws, r, 2, products[i])
        _cell(ws, r, 3, categories[i], align="left")
        _cell(ws, r, 4, int(inv[i]), fmt="#,##0")
        _cell(ws, r, 5, int(sold[i]), fmt="#,##0")
        _cell(ws, r, 6, float(forecast[i]), fmt="#,##0.0")
        _cell(ws, r, 7, float(lost[i]), fmt="#,##0.0")

    tr = r0 + n
    _cell(ws, tr, 1, "TOTAL", bold=True, align="left")
    for c in range(2, 7):
        _cell(ws, tr, c, "")
    _cell(ws, tr, 7, f"=SUM(G{r0}:G{tr - 1})", fmt="#,##0.0", bold=True)

    for col, w in zip("ABCDEFG", [10, 12, 14, 10, 10, 12, 14]):
        ws.column_dimensions[col].width = w

    return wb, {
        "rupturas": n,
        "total_lost": total_lost,
        "top": {"store_id": top_store, "product_id": top_prod, "lost": top_lost},
    }


def report_s3_key(data_execucao: str, dia_dado: str) -> str:
    return f"relatorios/D2/relatorio_D2_exec{data_execucao}_dado{dia_dado}.xlsx"


def handler(event: dict[str, Any], context: Any) -> dict[str, Any]:
    if isinstance(event, str):
        event = json.loads(event)

    bucket = get_bucket(event)
    data_execucao, dia_dado = resolve_dates(event)
    key = f"enriquecido/dt={dia_dado}/data.parquet"

    s3 = boto3.client("s3")
    table = read_parquet_s3(s3, bucket, key)
    rupturas = filter_rupturas(table)
    wb, meta = build_workbook(rupturas, data_execucao, dia_dado)
    out_key = report_s3_key(data_execucao, dia_dado)
    upload_workbook(s3, bucket, out_key, workbook_to_bytes(wb))

    return {
        "status": "OK",
        "bucket": bucket,
        "s3_key": out_key,
        "s3_uri": f"s3://{bucket}/{out_key}",
        "data_execucao": data_execucao,
        "dia_dado": dia_dado,
        **meta,
    }
