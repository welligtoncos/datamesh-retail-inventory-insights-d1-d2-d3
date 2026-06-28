"""
Lambda · relatório Excel D-3 (tendência de consumo)
Lógica mínima alinhada ao § intro / PROJETO_DATAMESH.txt §7:
  janela de N partições dt=, compara consumo úteis vs fim de semana e tendência.
"""
from __future__ import annotations

import json
from collections import defaultdict
from typing import Any

import boto3
from botocore.exceptions import ClientError
import pyarrow as pa

from common import (
    date_range,
    get_bucket,
    read_parquet_s3,
    resolve_dates,
    upload_workbook,
    workbook_to_bytes,
)
from excel_helpers import _cell, _header, _insight, _title

GREEN = "059669"
LT = "D1FAE5"


def load_window_tables(s3, bucket: str, dates: list[str]) -> pa.Table:
    tables: list[pa.Table] = []
    for dt in dates:
        key = f"enriquecido/dt={dt}/data.parquet"
        try:
            tables.append(read_parquet_s3(s3, bucket, key))
        except ClientError as exc:
            if exc.response.get("Error", {}).get("Code") == "NoSuchKey":
                continue
            raise
    if not tables:
        raise ValueError(f"Nenhuma partição enriquecido encontrada para janela {dates}")
    return pa.concat_tables(tables, promote_options="default")


def compute_trends(table: pa.Table) -> list[dict[str, Any]]:
    stores = table["Store ID"].to_pylist()
    products = table["Product ID"].to_pylist()
    categories = table["Category"].to_pylist()
    units = table["Units Sold"].to_pylist()
    weekend = table["_is_weekend"].to_pylist()
    dts = table["dt"].to_pylist()

    acc: dict[tuple[str, str], dict[str, Any]] = defaultdict(
        lambda: {
            "weekday_units": [],
            "weekend_units": [],
            "by_dt": defaultdict(int),
            "category": "",
        }
    )

    for i in range(len(stores)):
        key = (str(stores[i]), str(products[i]))
        acc[key]["category"] = str(categories[i])
        u = int(units[i])
        acc[key]["by_dt"][str(dts[i])] += u
        if int(weekend[i]) == 1:
            acc[key]["weekend_units"].append(u)
        else:
            acc[key]["weekday_units"].append(u)

    rows: list[dict[str, Any]] = []
    for (store, product), data in acc.items():
        wd = data["weekday_units"]
        we = data["weekend_units"]
        avg_wd = sum(wd) / len(wd) if wd else 0.0
        avg_we = sum(we) / len(we) if we else 0.0

        sorted_dts = sorted(data["by_dt"].keys())
        if len(sorted_dts) >= 2:
            first_half = sorted_dts[: len(sorted_dts) // 2]
            second_half = sorted_dts[len(sorted_dts) // 2 :]
            h1 = sum(data["by_dt"][d] for d in first_half)
            h2 = sum(data["by_dt"][d] for d in second_half)
            trend_pct = ((h2 - h1) / h1 * 100) if h1 > 0 else (100.0 if h2 > 0 else 0.0)
        elif len(sorted_dts) == 1:
            trend_pct = 0.0
        else:
            trend_pct = 0.0

        if trend_pct > 5:
            label = "Subindo"
        elif trend_pct < -5:
            label = "Caindo"
        else:
            label = "Estável"

        rows.append(
            {
                "store_id": store,
                "product_id": product,
                "category": data["category"],
                "avg_weekday": round(avg_wd, 1),
                "avg_weekend": round(avg_we, 1),
                "trend_pct": round(trend_pct, 1),
                "trend_label": label,
                "dias": len(sorted_dts),
            }
        )

    rows.sort(key=lambda r: abs(r["trend_pct"]), reverse=True)
    return rows


def build_workbook(
    rows: list[dict[str, Any]],
    data_execucao: str,
    dia_dado: str,
    janela_dias: int,
    particoes_lidas: int,
) -> tuple[Any, dict[str, Any]]:
    wb = __import__("openpyxl").Workbook()
    ws = wb.active
    ws.title = "D3_Tendencia"

    subindo = sum(1 for r in rows if r["trend_label"] == "Subindo")
    caindo = sum(1 for r in rows if r["trend_label"] == "Caindo")
    top = rows[0] if rows else None

    _title(
        ws,
        "Relatório D-3 · Tendência de Consumo",
        f"Execução {data_execucao} | janela {janela_dias}d até {dia_dado} | {particoes_lidas} partições",
        7,
        GREEN,
    )
    insight = (
        f"Janela de {particoes_lidas} dia(s): {subindo} pares loja×produto em alta, "
        f"{caindo} em queda (limiar ±5%). "
    )
    if top:
        insight += (
            f"Maior variação: {top['store_id']}/{top['product_id']} "
            f"({top['trend_pct']:+.1f}%, {top['trend_label']})."
        )
    _insight(ws, insight, 7, LT)
    _header(
        ws,
        6,
        [
            "Loja",
            "Produto",
            "Categoria",
            "Média úteis",
            "Média FDS",
            "Tendência %",
            "Classificação",
        ],
        GREEN,
    )

    r0 = 7
    for i, row in enumerate(rows):
        r = r0 + i
        _cell(ws, r, 1, row["store_id"])
        _cell(ws, r, 2, row["product_id"])
        _cell(ws, r, 3, row["category"], align="left")
        _cell(ws, r, 4, row["avg_weekday"], fmt="#,##0.0")
        _cell(ws, r, 5, row["avg_weekend"], fmt="#,##0.0")
        _cell(ws, r, 6, row["trend_pct"] / 100, fmt="0.0%")
        _cell(ws, r, 7, row["trend_label"], align="left")

    for col, w in zip("ABCDEFG", [10, 12, 14, 12, 12, 12, 14]):
        ws.column_dimensions[col].width = w

    return wb, {
        "pares": len(rows),
        "subindo": subindo,
        "caindo": caindo,
        "janela_dias": janela_dias,
        "particoes_lidas": particoes_lidas,
        "top_trend": top,
    }


def report_s3_key(data_execucao: str, dia_dado: str) -> str:
    return f"relatorios/D3/relatorio_D3_exec{data_execucao}_dado{dia_dado}.xlsx"


def handler(event: dict[str, Any], context: Any) -> dict[str, Any]:
    if isinstance(event, str):
        event = json.loads(event)

    bucket = get_bucket(event)
    data_execucao, dia_dado = resolve_dates(event)
    janela = int(event.get("janela_dias") or event.get("JANELA_DIAS") or 7)

    dates = date_range(dia_dado, janela)
    s3 = boto3.client("s3")
    table = load_window_tables(s3, bucket, dates)
    particoes = len(set(table["dt"].to_pylist()))
    rows = compute_trends(table)
    wb, meta = build_workbook(rows, data_execucao, dia_dado, janela, particoes)
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
