#!/usr/bin/env python3
"""E2-US03 · Compare origem parquet local vs AWS for a given dt."""
from __future__ import annotations

import argparse
import sys
import tempfile
from pathlib import Path

import boto3
import pandas as pd


def load_local(path: Path) -> pd.DataFrame:
    return pd.read_parquet(path)


def load_s3(bucket: str, dt: str, region: str) -> pd.DataFrame:
    key = f"origem/dt={dt}/data.parquet"
    tmp = Path(tempfile.gettempdir()) / f"origem_aws_{dt}.parquet"
    boto3.client("s3", region_name=region).download_file(bucket, key, str(tmp))
    return pd.read_parquet(tmp)


def compare(local_df: pd.DataFrame, aws_df: pd.DataFrame) -> list[str]:
    errors: list[str] = []
    if len(local_df) != len(aws_df):
        errors.append(f"row count: local={len(local_df)} aws={len(aws_df)}")
    if list(local_df.columns) != list(aws_df.columns):
        errors.append(f"columns: local={list(local_df.columns)} aws={list(aws_df.columns)}")
    else:
        for col in local_df.columns:
            if local_df[col].dtype != aws_df[col].dtype:
                errors.append(f"dtype {col}: local={local_df[col].dtype} aws={aws_df[col].dtype}")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description="Paridade origem local vs S3")
    parser.add_argument("--dt", default="2022-01-01")
    parser.add_argument("--bucket", default="retail-inventory-insights-dev")
    parser.add_argument("--region", default="sa-east-1")
    parser.add_argument(
        "--local",
        default="tabela_origem/dt=2022-01-01/data.parquet",
        help="Path to local parquet (use {dt} placeholder optional)",
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

    print(f"PARITY OK: dt={args.dt} rows={len(local_df)} cols={len(local_df.columns)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
