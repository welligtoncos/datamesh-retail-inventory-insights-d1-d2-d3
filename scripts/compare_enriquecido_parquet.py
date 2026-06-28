#!/usr/bin/env python3
"""E3-US03 · Compare enriquecido parquet local vs AWS for a given dt."""
from __future__ import annotations

import argparse
import sys
import tempfile
from pathlib import Path

import boto3
import pandas as pd

ENRICH_COLS = ["_revenue", "_stockout", "_lost", "_is_weekend", "dt"]


def load_local(path: Path) -> pd.DataFrame:
    return pd.read_parquet(path)


def load_s3(bucket: str, dt: str, region: str) -> pd.DataFrame:
    key = f"enriquecido/dt={dt}/data.parquet"
    tmp = Path(tempfile.gettempdir()) / f"enriquecido_aws_{dt}.parquet"
    boto3.client("s3", region_name=region).download_file(bucket, key, str(tmp))
    return pd.read_parquet(tmp)


def compare(local_df: pd.DataFrame, aws_df: pd.DataFrame) -> list[str]:
    errors: list[str] = []
    if len(local_df) != len(aws_df):
        errors.append(f"row count: local={len(local_df)} aws={len(aws_df)}")
    for col in ENRICH_COLS:
        if col not in local_df.columns:
            errors.append(f"missing local col: {col}")
        elif col not in aws_df.columns:
            errors.append(f"missing aws col: {col}")
    if errors:
        return errors
    for col in ENRICH_COLS:
        if local_df[col].dtype != aws_df[col].dtype:
            errors.append(f"dtype {col}: local={local_df[col].dtype} aws={aws_df[col].dtype}")
    local_sorted = local_df.sort_values(list(local_df.columns)).reset_index(drop=True)
    aws_sorted = aws_df.sort_values(list(aws_df.columns)).reset_index(drop=True)
    for col in ENRICH_COLS:
        if not local_sorted[col].equals(aws_sorted[col]):
            diff = (local_sorted[col] != aws_sorted[col]).sum()
            errors.append(f"values differ col {col}: {diff} rows")
    rev_local = local_df["_revenue"].sum()
    rev_aws = aws_df["_revenue"].sum()
    if rev_local != rev_aws:
        errors.append(f"revenue_sum: local={rev_local} aws={rev_aws}")
    so_local = int(local_df["_stockout"].sum())
    so_aws = int(aws_df["_stockout"].sum())
    if so_local != so_aws:
        errors.append(f"stockout_count: local={so_local} aws={so_aws}")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description="Paridade enriquecido local vs S3")
    parser.add_argument("--dt", default="2022-01-01")
    parser.add_argument("--bucket", default="retail-inventory-insights-dev-use1")
    parser.add_argument("--region", default="us-east-1")
    parser.add_argument(
        "--local",
        default="tabela_enriquecida/dt=2022-01-01/data.parquet",
    )
    args = parser.parse_args()

    local_path = Path(args.local.replace("{dt}", args.dt))
    if not local_path.exists():
        print(f"FAIL: local file not found: {local_path}", file=sys.stderr)
        return 1

    local_df = load_local(local_path)
    aws_df = load_s3(args.bucket, args.dt, args.region)
    errors = compare(local_df, aws_df)
    if errors:
        print("PARITY FAIL:")
        for e in errors:
            print(f"  - {e}")
        return 1

    stockout_pct = aws_df["_stockout"].mean() * 100
    print(
        f"PARITY OK: dt={args.dt} rows={len(local_df)} | "
        f"stockout_pct={stockout_pct:.1f}% | revenue_sum={aws_df['_revenue'].sum():,.2f}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
