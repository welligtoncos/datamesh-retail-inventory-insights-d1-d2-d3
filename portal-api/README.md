# Portal API · BFF FastAPI (E8-US12)

Backend for Frontend do portal datamesh — expõe RF-API-01, 02, 04–15.

## Desenvolvimento local

```powershell
cd portal-api
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt

$env:DATAMESH_BUCKET = "retail-inventory-insights-dev-use1"
$env:SFN_STATE_MACHINE_ARN = "arn:aws:states:us-east-1:303238378103:stateMachine:retail-inventory-insights-processar-dia-dev"
$env:AWS_REGION = "us-east-1"

uvicorn app.main:app --reload --port 8080
```

OpenAPI: http://localhost:8080/docs

## Testes

```powershell
# Na raiz do repo (parquet de referência)
cd portal-api
pytest
```

## Docker

```powershell
docker build -t portal-api:dev .
docker run --rm -p 8080:80 -e DATAMESH_BUCKET=... -e AWS_REGION=us-east-1 portal-api:dev
```

## Deploy dev

Ver `docs/portal-deploy-dev.md` e `scripts/w7-us12-deploy.ps1`.
