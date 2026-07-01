from pathlib import Path

import pyarrow.parquet as pq
import pytest

from app.domain.d1_aggregate import aggregate_d1_from_table
from app.domain.dates import add_one_day_iso, parse_iso_date

def _repo_root() -> Path:
    for parent in Path(__file__).resolve().parents:
        if (parent / "tabela_enriquecida").is_dir():
            return parent
    raise RuntimeError("Repo root not found")


REPO_ROOT = _repo_root()
PARQUET_PATH = REPO_ROOT / "tabela_enriquecida" / "dt=2022-01-01" / "data.parquet"


def test_parse_iso_date_valid() -> None:
    assert parse_iso_date("2022-01-01") == "2022-01-01"


def test_parse_iso_date_invalid() -> None:
    with pytest.raises(ValueError):
        parse_iso_date("01-01-2022")


def test_add_one_day() -> None:
    assert add_one_day_iso("2022-01-01") == "2022-01-02"


def test_d1_aggregate_reference_parquet() -> None:
    if not PARQUET_PATH.is_file():
        pytest.skip(f"Parquet de referência ausente: {PARQUET_PATH}")
    with PARQUET_PATH.open("rb") as handle:
        table = pq.read_table(handle)
    result = aggregate_d1_from_table(table, "2022-01-01", partition_exists=True)
    assert result["partition_exists"] is True
    assert result["total_unidades"] == 14484
    assert round(result["total_receita"], 2) == 879026.03
    assert len(result["ranking"]) == 69
