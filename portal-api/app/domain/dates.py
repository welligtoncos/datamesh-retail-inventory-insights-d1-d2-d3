import re
from datetime import date, datetime, timedelta

ISO_DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def parse_iso_date(value: str) -> str:
    raw = value.strip()[:10]
    if not ISO_DATE_RE.match(raw):
        raise ValueError(f"Data inválida: {value}")
    datetime.strptime(raw, "%Y-%m-%d")
    return raw


def add_one_day_iso(dt: str) -> str:
    normalized = parse_iso_date(dt)
    d = date.fromisoformat(normalized)
    return (d + timedelta(days=1)).isoformat()
