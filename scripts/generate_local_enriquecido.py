#!/usr/bin/env python3
"""Generate local tabela_enriquecida partition (brownfield baseline for E3-US03)."""
from __future__ import annotations

import argparse
import shutil
import sys
import tempfile
from pathlib import Path

import boto3
import numpy as np
import pandas as pd
from botocore.exceptions import ClientError


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


def load_origem(bucket: str, dt: str, region: str, local_origem: Path | None) -> pd.DataFrame:
    if local_origem and local_origem.exists():
        return pd.read_parquet(local_origem)
    key = f"origem/dt={dt}/data.parquet"
    tmp = Path(tempfile.gettempdir()) / f"origem_local_{dt}.parquet"
    try:
        boto3.client("s3", region_name=region).download_file(bucket, key, str(tmp))
    except ClientError as exc:
        code = exc.response.get("Error", {}).get("Code", "")
        if code in ("404", "NoSuchKey"):
            raise SystemExit(f"FAIL: origem not found s3://{bucket}/{key}") from exc
        raise
    return pd.read_parquet(tmp)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dt", default="2022-01-01")
    parser.add_argument("--bucket", default="retail-inventory-insights-dev-use1")
    parser.add_argument("--region", default="us-east-1")
    parser.add_argument("--out-dir", default="tabela_enriquecida")
    parser.add_argument(
        "--local-origem",
        default="",
        help="Optional local origem parquet; default read from S3",
    )
    args = parser.parse_args()

    dt_ts = pd.Timestamp(args.dt).normalize()
    local_origem = Path(args.local_origem) if args.local_origem else None
    dia = load_origem(args.bucket, str(dt_ts.date()), args.region, local_origem)
    if dia.empty:
        print(f"FAIL: empty origem for {dt_ts.date()}", file=sys.stderr)
        return 1

    enriched = enrich(dia, dt_ts)
    part = Path(args.out_dir) / f"dt={dt_ts.date()}"
    if part.exists():
        shutil.rmtree(part)
    part.mkdir(parents=True)
    out = part / "data.parquet"
    enriched.to_parquet(out, index=False)
    stockout_pct = enriched["_stockout"].mean() * 100
    print(
        f"OK: {len(enriched)} rows | stockout_pct={stockout_pct:.1f}% | "
        f"revenue_sum={enriched['_revenue'].sum():,.2f} -> {out}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
