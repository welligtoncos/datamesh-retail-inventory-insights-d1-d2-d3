#!/usr/bin/env python3
"""Gera Excel D-1 local (baseline E5-US03) — paridade com notebook §3."""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

import pandas as pd

REPO = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO / "lambda" / "reports"))

from gerar_relatorio_d1 import (  # noqa: E402
    aggregate_enriquecido_table,
    build_workbook,
    report_s3_key,
    workbook_to_bytes,
)
import pyarrow as pa  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(description="Baseline Excel D-1 local")
    parser.add_argument("--data-execucao", default="2022-01-02")
    parser.add_argument("--dia-dado", default="2022-01-01")
    parser.add_argument(
        "--enriquecido",
        default=None,
        help="Path to enriquecido parquet (default: tabela_enriquecida/dt=.../data.parquet)",
    )
    parser.add_argument(
        "--output",
        default=None,
        help="Output xlsx path (default: repo root relatorio_D1_...)",
    )
    args = parser.parse_args()

    enr_path = Path(
        args.enriquecido
        or REPO / f"tabela_enriquecida/dt={args.dia_dado}/data.parquet"
    )
    if not enr_path.exists():
        print(f"FAIL: enriquecido not found: {enr_path}", file=sys.stderr)
        return 1

    table = pa.Table.from_pandas(pd.read_parquet(enr_path), preserve_index=False)
    agg = aggregate_enriquecido_table(table)
    wb, meta = build_workbook(agg, args.data_execucao, args.dia_dado)

    out = Path(
        args.output
        or REPO / report_s3_key(args.data_execucao, args.dia_dado).replace("relatorios/D1/", "")
    )
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_bytes(workbook_to_bytes(wb))

    print(f"OK: {out.resolve()}")
    print(f"  produtos={meta['produtos']} unidades={meta['total_unidades']:,} receita={meta['total_receita']:,.2f}")
    for i, t in enumerate(meta["top3"], 1):
        print(f"  top{i}: {t['product_id']} ({t['category']}) {t['unidades']} un.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
