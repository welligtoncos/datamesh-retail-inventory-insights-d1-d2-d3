from __future__ import annotations

from fastapi import APIRouter, Header, Query
from fastapi.responses import PlainTextResponse

from app.config import Settings, get_settings
from app.domain.d1_aggregate import aggregate_d1_from_table
from app.domain.d2_filter import filter_rupturas_from_table
from app.domain.d3_trend import compute_trends_from_table, insight_date_range
from app.domain.dates import add_one_day_iso, parse_iso_date
from app.domain.enriquecido_kpis import (
    ENRIQUECIDO_EXTRA_COLUMNS,
    ORIGEM_COLUMNS,
    compute_enriquecido_kpis,
    paginate_rows,
    table_to_row_dicts,
)
from app.errors import PortalApiError
from app.repositories.athena import AthenaRepository
from app.repositories.cloudwatch import CloudWatchRepository
from app.repositories.s3 import S3Repository
from app.repositories.sfn import SfnRepository
from app.schemas import AthenaQueryTemplateRequest, ProcessarDiaRequest

router = APIRouter()


def _settings() -> Settings:
    return get_settings()


def _s3(settings: Settings | None = None) -> S3Repository:
    return S3Repository(settings or _settings())


@router.get("/health", response_class=PlainTextResponse)
def health() -> str:
    return "ok"


@router.get("/insumos")
def list_insumos() -> dict:
    items = _s3().list_insumo_items()
    return {"items": items, "prefix": "insumo/"}


@router.get("/origem/partitions")
def origem_partitions() -> dict:
    dts = _s3().list_partition_dts("origem")
    return {
        "partitions": dts,
        "latest": dts[0] if dts else None,
        "missing_dates": [],
    }


@router.get("/origem/{dt}/preview")
def origem_preview(
    dt: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1),
) -> dict:
    settings = _settings()
    page_size = min(page_size, settings.preview_max_page_size)
    normalized = parse_iso_date(dt)
    table = _s3(settings).read_parquet_layer("origem", normalized)
    if table is None:
        raise PortalApiError(404, "PARTITION_NOT_FOUND", f"Partição origem não encontrada: {normalized}")

    all_rows = table_to_row_dicts(table, ORIGEM_COLUMNS)
    page_rows, safe_page, total_pages = paginate_rows(all_rows, page, page_size)
    stores = len({r.get("Store ID") for r in all_rows})
    products = len({r.get("Product ID") for r in all_rows})

    return {
        "dt": normalized,
        "row_count": len(all_rows),
        "stores_count": stores,
        "products_count": products,
        "columns": ORIGEM_COLUMNS,
        "rows": page_rows,
        "page": safe_page,
        "page_size": page_size,
        "total_pages": total_pages,
        "total_rows": len(all_rows),
    }


@router.get("/enriquecido/partitions")
def enriquecido_partitions() -> dict:
    dts = _s3().list_partition_dts("enriquecido")
    return {"partitions": dts, "latest": dts[0] if dts else None}


@router.get("/enriquecido/{dt}/kpis")
def enriquecido_kpis(dt: str) -> dict:
    normalized = parse_iso_date(dt)
    table = _s3().read_parquet_layer("enriquecido", normalized)
    if table is None:
        raise PortalApiError(404, "PARTITION_NOT_FOUND", f"Partição enriquecido não encontrada: {normalized}")
    return compute_enriquecido_kpis(table, normalized)


@router.get("/enriquecido/{dt}/preview")
def enriquecido_preview(
    dt: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1),
) -> dict:
    settings = _settings()
    page_size = min(page_size, settings.preview_max_page_size)
    normalized = parse_iso_date(dt)
    table = _s3(settings).read_parquet_layer("enriquecido", normalized)
    if table is None:
        raise PortalApiError(404, "PARTITION_NOT_FOUND", f"Partição enriquecido não encontrada: {normalized}")

    columns = ORIGEM_COLUMNS + ENRIQUECIDO_EXTRA_COLUMNS
    all_rows = table_to_row_dicts(table, columns)
    page_rows, safe_page, total_pages = paginate_rows(all_rows, page, page_size)
    return {
        "dt": normalized,
        "columns": columns,
        "rows": page_rows,
        "page": safe_page,
        "page_size": page_size,
        "total_pages": total_pages,
        "total_rows": len(all_rows),
    }


def _report_key(layer: str, dt: str) -> tuple[str, str]:
    data_exec = add_one_day_iso(dt)
    filename = f"relatorio_{layer}_exec{data_exec}_dado{dt}.xlsx"
    key = f"relatorios/{layer}/{filename}"
    return key, filename


@router.get("/insights/d1")
def insights_d1(dt: str = Query(...)) -> dict:
    normalized = parse_iso_date(dt)
    table = _s3().read_parquet_layer("enriquecido", normalized)
    exists = table is not None
    if table is None:
        import pyarrow as pa

        table = pa.table({})
    return aggregate_d1_from_table(table, normalized, partition_exists=exists)


@router.get("/insights/d1/download")
def insights_d1_download(dt: str = Query(...)) -> dict:
    normalized = parse_iso_date(dt)
    key, filename = _report_key("D1", normalized)
    return _s3().presign_get(key, filename)


@router.get("/insights/d2")
def insights_d2(dt: str = Query(...)) -> dict:
    normalized = parse_iso_date(dt)
    table = _s3().read_parquet_layer("enriquecido", normalized)
    exists = table is not None
    if table is None:
        import pyarrow as pa

        table = pa.table({})
    return filter_rupturas_from_table(table, normalized, partition_exists=exists)


@router.get("/insights/d2/download")
def insights_d2_download(dt: str = Query(...)) -> dict:
    normalized = parse_iso_date(dt)
    key, filename = _report_key("D2", normalized)
    return _s3().presign_get(key, filename)


@router.get("/insights/d3")
def insights_d3(
    dt: str = Query(...),
    window: int = Query(7, ge=1, le=14),
) -> dict:
    normalized = parse_iso_date(dt)
    dates = insight_date_range(normalized, window)
    import pyarrow as pa

    tables = []
    for d in dates:
        t = _s3().read_parquet_layer("enriquecido", d)
        if t is not None:
            tables.append(t)
    if not tables:
        return compute_trends_from_table(pa.table({}), normalized, window, partition_exists=False)
    combined = pa.concat_tables(tables)
    return compute_trends_from_table(combined, normalized, window, partition_exists=True)


@router.get("/insights/d3/download")
def insights_d3_download(dt: str = Query(...)) -> dict:
    normalized = parse_iso_date(dt)
    key, filename = _report_key("D3", normalized)
    return _s3().presign_get(key, filename)


@router.post("/pipeline/processar-dia")
def pipeline_processar_dia(
    body: ProcessarDiaRequest,
    authorization: str | None = Header(default=None),
) -> dict:
    normalized = parse_iso_date(body.dt)
    return SfnRepository(_settings()).start_processar_dia(normalized, authorization)


@router.get("/pipeline/executions")
def pipeline_executions(limit: int = Query(20, ge=1, le=50)) -> dict:
    return SfnRepository(_settings()).list_executions(limit)


@router.get("/pipeline/executions/{execution_id}")
def pipeline_execution(execution_id: str) -> dict:
    settings = _settings()
    arn = f"{settings.sfn_state_machine_arn.replace(':stateMachine:', ':execution:')}:{execution_id}"
    return SfnRepository(settings).get_execution(arn)


@router.post("/athena/query-template")
def athena_query_template(body: AthenaQueryTemplateRequest) -> dict:
    params = body.params.model_dump(exclude_none=True) if body.params else {}
    return AthenaRepository(_settings()).run_template(body.template_id, params)


@router.get("/ops/alarms")
def ops_alarms() -> dict:
    return CloudWatchRepository(_settings()).describe_sfn_alarm()
