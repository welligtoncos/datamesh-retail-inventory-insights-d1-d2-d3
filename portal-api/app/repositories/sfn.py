from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError

from app.config import Settings
from app.errors import PortalApiError
from app.repositories.s3 import extract_jwt_claims

BOTO_CONFIG = Config(retries={"max_attempts": 3, "mode": "standard"})


def build_execution_arn(state_machine_arn: str, execution_name: str) -> str:
    base = state_machine_arn.replace(":stateMachine:", ":execution:")
    return f"{base}:{execution_name}"


class SfnRepository:
    def __init__(self, settings: Settings, client: Any | None = None) -> None:
        self.settings = settings
        self.client = client or boto3.client("states", region_name=settings.aws_region, config=BOTO_CONFIG)

    def start_processar_dia(self, dt: str, authorization: str | None) -> dict[str, Any]:
        claims = extract_jwt_claims(authorization)
        execution_name = f"processar-{dt}-{uuid.uuid4().hex[:8]}"
        try:
            resp = self.client.start_execution(
                stateMachineArn=self.settings.sfn_state_machine_arn,
                name=execution_name,
                input=f'{{"dt":"{dt}"}}',
            )
        except ClientError as exc:
            raise PortalApiError(503, "AWS_UNAVAILABLE", "Não foi possível iniciar a esteira.") from exc

        execution_arn = resp["executionArn"]
        execution_id = execution_arn.split(":")[-1]
        return {
            "execution_arn": execution_arn,
            "execution_id": execution_id,
            "dt": dt,
            "status": "RUNNING",
            "started_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "audit": {
                "sub": claims["sub"],
                "email": claims.get("email"),
                "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            },
        }

    def list_executions(self, limit: int) -> dict[str, Any]:
        try:
            resp = self.client.list_executions(
                stateMachineArn=self.settings.sfn_state_machine_arn,
                maxResults=min(limit, 50),
            )
        except ClientError as exc:
            raise PortalApiError(503, "AWS_UNAVAILABLE", "Não foi possível listar execuções.") from exc

        executions = [self._map_execution(item) for item in resp.get("executions", [])]
        return {"executions": executions, "limit": limit}

    def get_execution(self, execution_arn: str) -> dict[str, Any]:
        try:
            resp = self.client.describe_execution(executionArn=execution_arn)
        except ClientError as exc:
            raise PortalApiError(404, "EXECUTION_NOT_FOUND", "Execução não encontrada.") from exc
        return self._map_execution_detail(resp)

    def _map_execution(self, item: dict[str, Any]) -> dict[str, Any]:
        arn = item["executionArn"]
        started = item.get("startDate")
        stopped = item.get("stopDate")
        return {
            "execution_id": arn.split(":")[-1],
            "execution_arn": arn,
            "dt": self._extract_dt_from_name(arn.split(":")[-1]),
            "status": item.get("status", "RUNNING"),
            "started_at": started.isoformat().replace("+00:00", "Z") if started else "",
            "stopped_at": stopped.isoformat().replace("+00:00", "Z") if stopped else None,
            "duration_seconds": self._duration_seconds(started, stopped),
        }

    def _map_execution_detail(self, item: dict[str, Any]) -> dict[str, Any]:
        base = self._map_execution(item)
        return base

    @staticmethod
    def _duration_seconds(started: Any, stopped: Any) -> float | None:
        if not started or not stopped:
            return None
        return round((stopped - started).total_seconds(), 1)

    @staticmethod
    def _extract_dt_from_name(execution_name: str) -> str:
        parts = execution_name.split("-")
        if len(parts) >= 2 and len(parts[1]) == 10:
            return parts[1]
        return ""
