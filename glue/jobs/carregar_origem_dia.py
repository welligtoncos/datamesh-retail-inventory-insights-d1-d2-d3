"""
Glue Python Shell · carregar_origem_dia(dt)
Réplica brownfield de Esteira_3Relatorios_D1_D2_D3.ipynb §2
"""
import sys
import time
from io import BytesIO

import boto3
import pandas as pd
from awsglue.utils import getResolvedOptions

SCHEMA = [
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

INSUMO_KEY = "insumo/retail_store_inventory.csv"


def _delete_prefix(s3_client, bucket: str, prefix: str) -> None:
    paginator = s3_client.get_paginator("list_objects_v2")
    for page in paginator.paginate(Bucket=bucket, Prefix=prefix):
        for obj in page.get("Contents", []):
            s3_client.delete_object(Bucket=bucket, Key=obj["Key"])


def main() -> None:
    args = getResolvedOptions(sys.argv, ["dt", "bucket_name"])
    dt_arg = args["dt"]
    bucket = args["bucket_name"]

    start = time.time()
    s3 = boto3.client("s3")

    obj = s3.get_object(Bucket=bucket, Key=INSUMO_KEY)
    insumo = pd.read_csv(obj["Body"], parse_dates=["Date"])

    missing = [c for c in SCHEMA if c not in insumo.columns]
    if missing:
        raise ValueError(f"CSV incompleto — colunas faltando: {missing}")

    dt_ts = pd.Timestamp(dt_arg).normalize()
    dia = insumo[insumo["Date"].dt.normalize() == dt_ts].copy()
    if dia.empty:
        raise ValueError(f"Sem dados para {dt_ts.date()} no insumo.")

    prefix = f"origem/dt={dt_ts.date()}/"
    _delete_prefix(s3, bucket, prefix)

    buf = BytesIO()
    dia.to_parquet(buf, index=False)
    buf.seek(0)
    s3.put_object(Bucket=bucket, Key=f"{prefix}data.parquet", Body=buf.getvalue())

    duration = time.time() - start
    print(
        f"processado {dt_ts.date()} | rows: {len(dia):,} | "
        f"duration_sec: {duration:.2f} | dest: s3://{bucket}/{prefix}data.parquet"
    )


if __name__ == "__main__":
    main()
