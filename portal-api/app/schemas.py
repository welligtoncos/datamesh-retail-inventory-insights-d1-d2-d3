from pydantic import BaseModel, Field


class ProcessarDiaRequest(BaseModel):
    dt: str


class AthenaQueryParams(BaseModel):
    dt: str | None = None
    dts: list[str] | None = None
    limit: int | None = None


class AthenaQueryTemplateRequest(BaseModel):
    template_id: str
    params: AthenaQueryParams | None = None
