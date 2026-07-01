# NFR Design · U8 Portal API (E8-US12)

**Data:** 2026-07-01

---

## Config (`app/config.py`)

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    aws_region: str = "us-east-1"
    datamesh_bucket: str
    sfn_state_machine_arn: str
    athena_database: str = "retail_inventory_insights_dev"
    athena_workgroup: str = "retail-inventory-insights-dev"
    athena_results_prefix: str = "athena-results/"
    sfn_alarm_name: str = "retail-inventory-insights-processar-dia-failed-dev"
    presigned_ttl_seconds: int = 900
    preview_max_page_size: int = 500
    athena_max_rows: int = 100
    athena_poll_timeout_seconds: int = 60
    log_level: str = "INFO"
    cors_origins: str = ""  # comma-separated

    class Config:
        env_file = ".env"
```

---

## Logging (`app/logging.py`)

```python
import logging
import sys

def configure_logging(level: str = "INFO") -> None:
    logging.basicConfig(
        level=level,
        stream=sys.stdout,
        format='{"ts":"%(asctime)s","level":"%(levelname)s","msg":"%(message)s"}',
    )
```

- Request ID middleware: `X-Request-Id` header ou uuid4.
- Não logar `Authorization` header.

---

## Exception handler

```python
@app.exception_handler(PortalApiError)
async def portal_error_handler(request, exc: PortalApiError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "code": exc.code},
    )
```

---

## boto3 client factory

```python
from botocore.config import Config

BOTO_CONFIG = Config(
    retries={"max_attempts": 3, "mode": "standard"},
    connect_timeout=5,
    read_timeout=30,
)

def s3_client(settings: Settings):
    return boto3.client("s3", region_name=settings.aws_region, config=BOTO_CONFIG)
```

Athena client: `read_timeout=65` no poll loop.

---

## S3 partitions repository

```python
def list_partition_dts(s3, bucket: str, prefix: str) -> list[str]:
    # prefix e.g. "enriquecido/dt="
    # ListObjectsV2 Delimiter="/" → parse dt=YYYY-MM-DD
```

---

## S3 Parquet read

```python
def read_parquet_dt(s3, bucket: str, layer: str, dt: str) -> pa.Table:
    key = f"{layer}/dt={dt}/data.parquet"
    obj = s3.get_object(Bucket=bucket, Key=key)
    return pq.read_table(BytesIO(obj["Body"].read()))
```

Cache in-memory **não** no MVP (stateless).

---

## Athena service (poll loop)

```python
async def run_template(template_id: str, params: dict) -> AthenaQueryTemplateResponse:
    sql = render_sql(template_id, params)  # whitelist only
    qid = start_query(sql)
    deadline = time.monotonic() + settings.athena_poll_timeout_seconds
    while time.monotonic() < deadline:
        status = get_execution(qid)
        if status in ("SUCCEEDED", "FAILED", "CANCELLED"):
            break
        await asyncio.sleep(1)
    else:
        raise PortalApiError(408, "ATHENA_TIMEOUT", "Consulta Athena excedeu 60 segundos.")
    rows, columns, truncated = fetch_results(qid, max_rows=100)
```

---

## SFN execution ARN

```python
def build_execution_arn(state_machine_arn: str, execution_name: str) -> str:
    base = state_machine_arn.replace(":stateMachine:", ":execution:")
    return f"{base}:{execution_name}"
```

---

## JWT audit (pipeline)

```python
def extract_audit_claims(authorization: str | None) -> dict:
    # Decode JWT payload segment 2 base64 (no verify) for sub/email
    # Fallback sub="unknown"
    return {"sub": sub, "email": email, "timestamp": datetime.utcnow().isoformat() + "Z"}
```

---

## CORS middleware (dev local opcional)

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)
```

API GW já configura CORS para CloudFront — middleware útil para `uvicorn` local.

---

## Dockerfile (sketch)

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app ./app
EXPOSE 80
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "80"]
```

---

## pytest + PBT

```python
from hypothesis import given, strategies as st

@given(st.integers(min_value=0, max_value=1000))
def test_d1_total_units_matches_ranking_sum(units):
    rows = [...]
    result = aggregate_d1(rows, "2022-01-01")
    assert result.total_unidades == sum(r.unidades for r in result.ranking)
```

Fixtures: `tabela_enriquecida/dt=2022-01-01/data.parquet` para testes locais.

---

## Extension compliance (design)

| Extension | Implementação planejada |
|-----------|-------------------------|
| Security | Whitelist Athena; presigned TTL; no secrets in logs |
| Resiliency | boto3 retries; health endpoint; 503 mapping |
| PBT | `tests/unit/test_d1_aggregate.py`, `test_d2_filter.py`, `test_d3_trend.py` |
