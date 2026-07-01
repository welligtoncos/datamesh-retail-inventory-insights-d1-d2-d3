from hypothesis import given
from hypothesis import strategies as st

from app.domain.dates import parse_iso_date


@given(
    y=st.integers(min_value=2000, max_value=2030),
    m=st.integers(min_value=1, max_value=12),
    d=st.integers(min_value=1, max_value=28),
)
def test_parse_iso_date_roundtrip(y: int, m: int, d: int) -> None:
    iso = f"{y:04d}-{m:02d}-{d:02d}"
    assert parse_iso_date(iso) == iso
