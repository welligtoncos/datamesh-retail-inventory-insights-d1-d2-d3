"""Utilitários compartilhados pelos relatórios Lambda D-1/D-2/D-3."""
from __future__ import annotations

import os
from datetime import datetime, timedelta
from io import BytesIO
from typing import Any

import boto3
import pyarrow.parquet as pq
from openpyxl import Workbook


def parse_date(value: str) -> str:
    return datetime.strptime(str(value)[:10], "%Y-%m-%d").date().isoformat()


def resolve_dates(event: dict[str, Any]) -> tuple[str, str]:
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

    return parse_date(data_execucao), parse_date(dia_dado)


def get_bucket(event: dict[str, Any]) -> str:
    bucket = (
        event.get("bucket_name")
        or os.environ.get("BUCKET_NAME")
        or os.environ.get("bucket_name")
    )
    if not bucket:
        raise ValueError("bucket_name ausente (env BUCKET_NAME ou event)")
    return bucket


def read_parquet_s3(s3_client, bucket: str, key: str):
    obj = s3_client.get_object(Bucket=bucket, Key=key)
    return pq.read_table(BytesIO(obj["Body"].read()))


def date_range(end_date: str, window_days: int) -> list[str]:
    end = datetime.strptime(end_date[:10], "%Y-%m-%d").date()
    start = end - timedelta(days=window_days - 1)
    days: list[str] = []
    cur = start
    while cur <= end:
        days.append(cur.isoformat())
        cur += timedelta(days=1)
    return days


def workbook_to_bytes(wb: Workbook) -> bytes:
    buf = BytesIO()
    wb.save(buf)
    return buf.getvalue()


def upload_workbook(s3_client, bucket: str, key: str, body: bytes) -> None:
    s3_client.put_object(
        Bucket=bucket,
        Key=key,
        Body=body,
        ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )
