from __future__ import annotations

import base64
import json
import logging
import re
from datetime import datetime
from io import BytesIO
from typing import Any

import boto3
import pyarrow.parquet as pq
from botocore.config import Config
from botocore.exceptions import ClientError

from app.config import Settings
from app.errors import PortalApiError

logger = logging.getLogger(__name__)

BOTO_CONFIG = Config(retries={"max_attempts": 3, "mode": "standard"}, connect_timeout=5, read_timeout=30)

DT_PREFIX_RE = re.compile(r"dt=(\d{4}-\d{2}-\d{2})/")


class S3Repository:
    def __init__(self, settings: Settings, client: Any | None = None) -> None:
        self.settings = settings
        self.client = client or boto3.client("s3", region_name=settings.aws_region, config=BOTO_CONFIG)

    def list_partition_dts(self, layer: str) -> list[str]:
        prefix = f"{layer}/dt="
        dts: set[str] = set()
        paginator = self.client.get_paginator("list_objects_v2")
        for page in paginator.paginate(Bucket=self.settings.datamesh_bucket, Prefix=prefix, Delimiter="/"):
            for cp in page.get("CommonPrefixes", []):
                match = DT_PREFIX_RE.search(cp.get("Prefix", ""))
                if match:
                    dts.add(match.group(1))
        return sorted(dts, reverse=True)

    def object_exists(self, key: str) -> bool:
        try:
            self.client.head_object(Bucket=self.settings.datamesh_bucket, Key=key)
            return True
        except ClientError as exc:
            if exc.response["Error"]["Code"] in ("404", "NoSuchKey", "NotFound"):
                return False
            raise PortalApiError(503, "AWS_UNAVAILABLE", "Não foi possível acessar o S3.") from exc

    def read_parquet_layer(self, layer: str, dt: str) -> Any:
        key = f"{layer}/dt={dt}/data.parquet"
        if not self.object_exists(key):
            return None
        try:
            obj = self.client.get_object(Bucket=self.settings.datamesh_bucket, Key=key)
            return pq.read_table(BytesIO(obj["Body"].read()))
        except ClientError as exc:
            logger.exception("S3 read failed key=%s", key)
            raise PortalApiError(503, "AWS_UNAVAILABLE", "Não foi possível ler os dados.") from exc

    def list_insumo_items(self) -> list[dict[str, Any]]:
        prefix = "insumo/"
        items: list[dict[str, Any]] = []
        paginator = self.client.get_paginator("list_objects_v2")
        for page in paginator.paginate(Bucket=self.settings.datamesh_bucket, Prefix=prefix):
            for obj in page.get("Contents", []):
                key = obj["Key"]
                if key.endswith("/"):
                    continue
                name = key.split("/")[-1]
                items.append(
                    {
                        "key": key,
                        "name": name,
                        "size_bytes": obj.get("Size", 0),
                        "last_modified": obj.get("LastModified", datetime.utcnow()).isoformat() + "Z",
                    }
                )
        items.sort(key=lambda x: x["last_modified"], reverse=True)
        return items

    def presign_get(self, key: str, filename: str) -> dict[str, Any]:
        if not self.object_exists(key):
            raise PortalApiError(404, "REPORT_NOT_FOUND", f"Relatório não encontrado: {key}")
        url = self.client.generate_presigned_url(
            "get_object",
            Params={"Bucket": self.settings.datamesh_bucket, "Key": key},
            ExpiresIn=self.settings.presigned_ttl_seconds,
        )
        return {
            "presigned_url": url,
            "expires_in_seconds": self.settings.presigned_ttl_seconds,
            "s3_key": key,
            "filename": filename,
        }


def extract_jwt_claims(authorization: str | None) -> dict[str, str | None]:
    if not authorization or not authorization.lower().startswith("bearer "):
        return {"sub": "unknown", "email": None}
    token = authorization.split(" ", 1)[1].strip()
    parts = token.split(".")
    if len(parts) < 2:
        return {"sub": "unknown", "email": None}
    try:
        padding = "=" * (-len(parts[1]) % 4)
        payload = json.loads(base64.urlsafe_b64decode(parts[1] + padding))
        return {
            "sub": str(payload.get("sub", "unknown")),
            "email": payload.get("email"),
        }
    except (json.JSONDecodeError, ValueError):
        return {"sub": "unknown", "email": None}
