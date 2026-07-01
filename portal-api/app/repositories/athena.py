from __future__ import annotations

import time
from typing import Any

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError

from app.athena.sql_builder import build_sql, validate_template_params
from app.config import Settings
from app.errors import PortalApiError

BOTO_CONFIG = Config(retries={"max_attempts": 3, "mode": "standard"}, read_timeout=65)


class AthenaRepository:
    def __init__(self, settings: Settings, client: Any | None = None) -> None:
        self.settings = settings
        self.client = client or boto3.client("athena", region_name=settings.aws_region, config=BOTO_CONFIG)

    def run_template(self, template_id: str, params: dict[str, Any] | None) -> dict[str, Any]:
        safe_params = validate_template_params(template_id, params or {})
        sql = build_sql(self.settings.athena_database, template_id, safe_params)
        output = f"s3://{self.settings.datamesh_bucket}/{self.settings.athena_results_prefix}"

        try:
            start = self.client.start_query_execution(
                QueryString=sql,
                QueryExecutionContext={"Database": self.settings.athena_database},
                ResultConfiguration={"OutputLocation": output},
                WorkGroup=self.settings.athena_workgroup,
            )
        except ClientError as exc:
            raise PortalApiError(503, "AWS_UNAVAILABLE", "Não foi possível iniciar consulta Athena.") from exc

        qid = start["QueryExecutionId"]
        deadline = time.monotonic() + self.settings.athena_poll_timeout_seconds
        status = "RUNNING"
        state_reason = None
        execution_time_ms = None
        data_scan_bytes = None

        while time.monotonic() < deadline:
            resp = self.client.get_query_execution(QueryExecutionId=qid)
            execution = resp["QueryExecution"]
            status = execution["Status"]["State"]
            if status in ("SUCCEEDED", "FAILED", "CANCELLED"):
                state_reason = execution["Status"].get("StateChangeReason")
                stats = execution.get("Statistics", {})
                execution_time_ms = int(stats.get("EngineExecutionTimeInMillis", 0))
                data_scan_bytes = int(stats.get("DataScannedInBytes", 0))
                break
            time.sleep(1)
        else:
            raise PortalApiError(408, "ATHENA_TIMEOUT", "Consulta Athena excedeu 60 segundos.")

        if status != "SUCCEEDED":
            raise PortalApiError(
                502,
                "ATHENA_FAILED",
                state_reason or "A consulta Athena falhou.",
            )

        columns, rows, truncated = self._fetch_results(qid)
        return {
            "query_execution_id": qid,
            "template_id": template_id,
            "status": "SUCCEEDED",
            "columns": columns,
            "rows": rows,
            "row_count": len(rows),
            "truncated": truncated,
            "execution_time_ms": execution_time_ms,
            "data_scan_bytes": data_scan_bytes,
        }

    def _fetch_results(self, query_execution_id: str) -> tuple[list[str], list[dict[str, Any]], bool]:
        paginator = self.client.get_paginator("get_query_results")
        columns: list[str] = []
        rows: list[dict[str, Any]] = []
        truncated = False
        max_rows = self.settings.athena_max_rows

        for page in paginator.paginate(QueryExecutionId=query_execution_id):
            result_set = page["ResultSet"]
            if not columns:
                header = result_set["Rows"][0]
                columns = [c.get("VarCharValue", "") for c in header["Data"]]

            data_rows = result_set["Rows"][1:] if columns else result_set["Rows"]
            for row in data_rows:
                if len(rows) >= max_rows:
                    truncated = True
                    break
                values = row.get("Data", [])
                record: dict[str, Any] = {}
                for i, col in enumerate(columns):
                    raw = values[i].get("VarCharValue") if i < len(values) else None
                    if raw is None:
                        record[col] = None
                    else:
                        try:
                            if "." in raw:
                                record[col] = float(raw)
                            else:
                                record[col] = int(raw)
                        except ValueError:
                            record[col] = raw
                rows.append(record)
            if truncated:
                break

        return columns, rows, truncated
