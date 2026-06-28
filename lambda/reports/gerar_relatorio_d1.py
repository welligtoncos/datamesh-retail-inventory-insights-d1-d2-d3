"""
Lambda · relatório Excel D-1 (produtos vendidos)
Réplica brownfield de Esteira_3Relatorios_D1_D2_D3.ipynb §3
"""
from __future__ import annotations

import json
import os
from datetime import datetime, timedelta
from io import BytesIO
from typing import Any

import boto3
import pyarrow as pa
import pyarrow.compute as pc
import pyarrow.parquet as pq
from openpyxl import Workbook

from excel_helpers import _cell, _header, _insight, _title

BLUE = "2563EB"
LT = "DBEAFE"


def _parse_date(value: str) -> str:
    return datetime.strptime(str(value)[:10], "%Y-%m-%d").date().isoformat()


def _resolve_dates(event: dict[str, Any]) -> tuple[str, str]:
    data_execucao = event.get("data_execucao") or event.get("DATA_EXECUCAO")
    dia_dado = event.get("dia_dado") or event.get("DIA_DADO") or event.get("dt")

    if data_execucao and not dia_dado:
        de = datetime.strptime(str(data_execucao)[:10], "%Y-%m-%d").date()
        dia_dado = (de - timedelta(days=1)).isoformat()
    if dia_dado and not data_execucao:
        dd = datetime.strptime(str(dia_dado)[:10], "%Y-%m-%d").date()
        data_execucao = (dd + timedelta(days=1)).isoformat()

    if not data_execucao or not dia_dado:
        raise ValueError(
            "Informe data_execucao e dia_dado (ou dt / DIA_DADO). "
            'Ex.: {"data_execucao":"2022-01-02","dia_dado":"2022-01-01"}'
        )

    return str(data_execucao)[:10], str(dia_dado)[:10]


def aggregate_enriquecido_table(table: pa.Table) -> pa.Table:
    agg = table.group_by(["Product ID", "Category"]).aggregate(
        [("Units Sold", "sum"), ("_revenue", "sum")]
    )
    agg = agg.rename_columns(["Product ID", "Category", "unidades", "receita"])
    indices = pc.sort_indices(agg["unidades"], sort_keys=[("unidades", "descending")])
    return agg.take(indices)


def aggregate_enriquecido_from_bytes(body: bytes) -> pa.Table:
    return aggregate_enriquecido_table(pq.read_table(BytesIO(body)))


def table_to_rows(agg: pa.Table) -> list[dict[str, Any]]:
    products = agg["Product ID"].to_pylist()
    categories = agg["Category"].to_pylist()
    unidades = agg["unidades"].to_pylist()
    receitas = agg["receita"].to_pylist()
    return [
        {
            "product_id": str(products[i]),
            "category": str(categories[i]),
            "unidades": int(unidades[i]),
            "receita": float(receitas[i]),
        }
        for i in range(agg.num_rows)
    ]


def build_workbook(
    agg: pa.Table, data_execucao: str, dia_dado: str
) -> tuple[Workbook, dict[str, Any]]:
    rows = table_to_rows(agg)
    total_u = sum(r["unidades"] for r in rows)
    top = rows[0]
    top3_pct = sum(r["unidades"] for r in rows[:3]) / total_u * 100 if total_u else 0.0

    wb = Workbook()
    ws = wb.active
    ws.title = "D1_Produtos_Vendidos"

    _title(
        ws,
        "Relatório D-1 · Produtos Vendidos",
        f"Execução {data_execucao} | dado D-1: {dia_dado} | gerado pela esteira",
        5,
        BLUE,
    )
    _insight(
        ws,
        f"No dado de {dia_dado} (D-1), o produto líder foi "
        f"{top['product_id']} ({top['category']}) com {top['unidades']} un. "
        f"Os 3 primeiros concentram {top3_pct:.0f}% das vendas.",
        5,
        LT,
    )
    _header(
        ws,
        6,
        ["Produto", "Categoria", "Unid. Vendidas", "Receita (R$)", "% do Total"],
        BLUE,
    )

    r0 = 7
    for i, row in enumerate(rows):
        r = r0 + i
        _cell(ws, r, 1, row["product_id"])
        _cell(ws, r, 2, row["category"], align="left")
        _cell(ws, r, 3, row["unidades"], fmt="#,##0")
        _cell(ws, r, 4, row["receita"], fmt="#,##0.00")
        _cell(ws, r, 5, f"=C{r}/$C${r0 + len(rows)}", fmt="0.0%")

    tr = r0 + len(rows)
    _cell(ws, tr, 1, "TOTAL", bold=True, align="left")
    _cell(ws, tr, 2, "")
    _cell(ws, tr, 3, f"=SUM(C{r0}:C{tr - 1})", fmt="#,##0", bold=True)
    _cell(ws, tr, 4, f"=SUM(D{r0}:D{tr - 1})", fmt="#,##0.00", bold=True)
    _cell(ws, tr, 5, f"=SUM(E{r0}:E{tr - 1})", fmt="0.0%", bold=True)

    for col, w in zip("ABCDE", [12, 14, 16, 16, 12]):
        ws.column_dimensions[col].width = w

    meta = {
        "produtos": len(rows),
        "total_unidades": total_u,
        "total_receita": float(sum(r["receita"] for r in rows)),
        "top3": rows[:3],
    }
    return wb, meta


def workbook_to_bytes(wb: Workbook) -> bytes:
    buf = BytesIO()
    wb.save(buf)
    return buf.getvalue()


def report_s3_key(data_execucao: str, dia_dado: str) -> str:
    return f"relatorios/D1/relatorio_D1_exec{data_execucao}_dado{dia_dado}.xlsx"


def handler(event: dict[str, Any], context: Any) -> dict[str, Any]:
    if isinstance(event, str):
        event = json.loads(event)

    bucket = (
        event.get("bucket_name")
        or os.environ.get("BUCKET_NAME")
        or os.environ.get("bucket_name")
    )
    if not bucket:
        raise ValueError("bucket_name ausente (env BUCKET_NAME ou event)")

    data_execucao, dia_dado = _resolve_dates(event)
    enriquecido_key = f"enriquecido/dt={dia_dado}/data.parquet"

    s3 = boto3.client("s3")
    obj = s3.get_object(Bucket=bucket, Key=enriquecido_key)
    agg = aggregate_enriquecido_from_bytes(obj["Body"].read())
    wb, meta = build_workbook(agg, data_execucao, dia_dado)
    body = workbook_to_bytes(wb)
    out_key = report_s3_key(data_execucao, dia_dado)

    s3.put_object(
        Bucket=bucket,
        Key=out_key,
        Body=body,
        ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )

    return {
        "status": "OK",
        "bucket": bucket,
        "s3_key": out_key,
        "s3_uri": f"s3://{bucket}/{out_key}",
        "data_execucao": data_execucao,
        "dia_dado": dia_dado,
        **meta,
    }
