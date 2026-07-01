from __future__ import annotations

from typing import Any

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError

from app.config import Settings
from app.errors import PortalApiError

BOTO_CONFIG = Config(retries={"max_attempts": 3, "mode": "standard"})


class CloudWatchRepository:
    def __init__(self, settings: Settings, client: Any | None = None) -> None:
        self.settings = settings
        self.client = client or boto3.client("cloudwatch", region_name=settings.aws_region, config=BOTO_CONFIG)

    def describe_sfn_alarm(self) -> dict[str, Any]:
        try:
            resp = self.client.describe_alarms(AlarmNames=[self.settings.sfn_alarm_name])
        except ClientError as exc:
            raise PortalApiError(503, "AWS_UNAVAILABLE", "Não foi possível consultar alarmes.") from exc

        alarms = resp.get("MetricAlarms", [])
        if not alarms:
            return {
                "alarms": [],
                "pipeline_operational": True,
            }

        items = []
        for alarm in alarms:
            state = alarm.get("StateValue", "INSUFFICIENT_DATA")
            items.append(
                {
                    "alarm_name": alarm.get("AlarmName", self.settings.sfn_alarm_name),
                    "state": state,
                    "state_reason": alarm.get("StateReason"),
                    "updated_at": alarm.get("StateUpdatedTimestamp").isoformat()
                    if alarm.get("StateUpdatedTimestamp")
                    else None,
                    "metric": alarm.get("MetricName"),
                    "resource_arn": alarm.get("AlarmArn"),
                }
            )

        operational = all(a["state"] == "OK" for a in items)
        return {"alarms": items, "pipeline_operational": operational}
