from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    aws_region: str = "us-east-1"
    datamesh_bucket: str = "retail-inventory-insights-dev-use1"
    sfn_state_machine_arn: str = (
        "arn:aws:states:us-east-1:303238378103:stateMachine:"
        "retail-inventory-insights-processar-dia-dev"
    )
    athena_database: str = "retail_inventory_insights_dev"
    athena_workgroup: str = "retail-inventory-insights-dev"
    athena_results_prefix: str = "athena-results/"
    sfn_alarm_name: str = "retail-inventory-insights-processar-dia-failed-dev"
    presigned_ttl_seconds: int = 900
    preview_max_page_size: int = 500
    preview_default_page_size: int = 50
    athena_max_rows: int = 100
    athena_poll_timeout_seconds: int = 60
    log_level: str = "INFO"
    cors_origins: str = ""

    @property
    def cors_origins_list(self) -> list[str]:
        if not self.cors_origins.strip():
            return []
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
