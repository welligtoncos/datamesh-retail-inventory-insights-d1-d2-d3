"""
Glue Python Shell · enriquecer_dia(dt)
Réplica brownfield de Esteira_3Relatorios_D1_D2_D3.ipynb §2
"""
import sys
import time
from io import BytesIO

import boto3
import numpy as np
import pandas as pd
from awsglue.utils import getResolvedOptions
from botocore.exceptions import ClientError

ENRICH_COLS = ["_revenue", "_stockout", "_lost", "_is_weekend", "dt"]


def _delete_prefix(s3_client, bucket: str, prefix: str) -> None:
    paginator = s3_client.get_paginator("list_objects_v2")
    for page in paginator.paginate(Bucket=bucket, Prefix=prefix):
        for obj in page.get("Contents", []):
            s3_client.delete_object(Bucket=bucket, Key=obj["Key"])


def enrich(dia: pd.DataFrame, dt_ts: pd.Timestamp) -> pd.DataFrame:
    out = dia.copy()
    out["_revenue"] = (out["Units Sold"] * out["Price"]).round(2)
    out["_stockout"] = (
        (out["Units Sold"] >= out["Inventory Level"])
        & (out["Demand Forecast"] > out["Inventory Level"])
    ).astype(int)
    out["_lost"] = np.where(
        out["_stockout"] == 1,
        (out["Demand Forecast"] - out["Units Sold"]).clip(lower=0),
        0,
    ).round(1)
    out["_is_weekend"] = (pd.to_datetime(out["Date"]).dt.weekday >= 5).astype(int)
    out["dt"] = str(dt_ts.date())
    return out


def main() -> None:
    args = getResolvedOptions(sys.argv, ["dt", "bucket_name"])
    dt_ts = pd.Timestamp(args["dt"]).normalize()
    bucket = args["bucket_name"]

    start = time.time()
    s3 = boto3.client("s3")

    origem_key = f"origem/dt={dt_ts.date()}/data.parquet"
    try:
        obj = s3.get_object(Bucket=bucket, Key=origem_key)
    except ClientError as exc:
        code = exc.response.get("Error", {}).get("Code", "")
        if code in ("NoSuchKey", "404"):
            raise ValueError(
                f"Origem ausente para {dt_ts.date()}: s3://{bucket}/{origem_key}"
            ) from exc
        raise

    dia = pd.read_parquet(BytesIO(obj["Body"].read()))
    if dia.empty:
        raise ValueError(f"Origem vazia para {dt_ts.date()}.")

    enriched = enrich(dia, dt_ts)
    prefix = f"enriquecido/dt={dt_ts.date()}/"
    _delete_prefix(s3, bucket, prefix)

    buf = BytesIO()
    enriched.to_parquet(buf, index=False)
    buf.seek(0)
    s3.put_object(Bucket=bucket, Key=f"{prefix}data.parquet", Body=buf.getvalue())

    duration = time.time() - start
    stockout_pct = enriched["_stockout"].mean() * 100
    print(
        f"processado {dt_ts.date()} | rows: {len(enriched):,} | "
        f"stockout_pct: {stockout_pct:.1f}% | revenue_sum: {enriched['_revenue'].sum():,.2f} | "
        f"duration_sec: {duration:.2f} | dest: s3://{bucket}/{prefix}data.parquet"
    )


if __name__ == "__main__":
    main()
