#!/usr/bin/env python3
"""Generate local tabela_origem partition (brownfield baseline for E2-US03)."""
from __future__ import annotations

import argparse
import shutil
import sys
from pathlib import Path

import boto3
import pandas as pd

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


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dt", default="2022-01-01")
    parser.add_argument("--bucket", default="retail-inventory-insights-dev")
    parser.add_argument("--region", default="sa-east-1")
    parser.add_argument("--out-dir", default="tabela_origem")
    args = parser.parse_args()

    s3 = boto3.client("s3", region_name=args.region)
    obj = s3.get_object(Bucket=args.bucket, Key="insumo/retail_store_inventory.csv")
    insumo = pd.read_csv(obj["Body"], parse_dates=["Date"])

    missing = [c for c in SCHEMA if c not in insumo.columns]
    if missing:
        print(f"FAIL: missing columns {missing}", file=sys.stderr)
        return 1

    dt_ts = pd.Timestamp(args.dt).normalize()
    dia = insumo[insumo["Date"].dt.normalize() == dt_ts].copy()
    if dia.empty:
        print(f"FAIL: no rows for {dt_ts.date()}", file=sys.stderr)
        return 1

    part = Path(args.out_dir) / f"dt={dt_ts.date()}"
    if part.exists():
        shutil.rmtree(part)
    part.mkdir(parents=True)
    out = part / "data.parquet"
    dia.to_parquet(out, index=False)
    print(f"OK: {len(dia)} rows -> {out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
