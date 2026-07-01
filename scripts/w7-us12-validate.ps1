# W7-US12 Validate · E8-US12 FastAPI BFF
# Uso (repo root): .\scripts\w7-us12-validate.ps1

$ErrorActionPreference = "Stop"
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$ApiDir = Join-Path $RepoRoot "portal-api"
$VenvPython = Join-Path $ApiDir ".venv\Scripts\python.exe"
if (Test-Path $VenvPython) {
    $Python = $VenvPython
} else {
    $Python = "python"
    Write-Host "Aviso: portal-api/.venv ausente; use: python -m venv .venv && pip install -r requirements-dev.txt" -ForegroundColor Yellow
}

Write-Host "=== W7 E8-US12 Portal API Validate ===" -ForegroundColor Cyan

Push-Location $ApiDir

Write-Host "`n[1] pytest (unit + PBT)..." -ForegroundColor Yellow
& $Python -m pytest -q
if ($LASTEXITCODE -ne 0) { Pop-Location; exit $LASTEXITCODE }

Write-Host "`n[2] Import smoke (FastAPI app)..." -ForegroundColor Yellow
& $Python -c "from app.main import app; print('routes:', len(app.routes))"
if ($LASTEXITCODE -ne 0) { Pop-Location; exit $LASTEXITCODE }

Pop-Location

Write-Host "`n[3] Checklist manual E2E (apos deploy ECS):" -ForegroundColor Yellow
Write-Host @"
  [ ] GET /health publico (API GW) -> 200 ok
  [ ] Login Cognito CloudFront dev
  [ ] Home sem chip demonstracao
  [ ] /insights/d1?dt=2022-01-01 -> 69 produtos, 14484 un.
  [ ] Download D-1 Excel valido
  [ ] /enriquecido, /origem, /insumos dados reais
  [ ] /operacoes dispara SFN
  [ ] /enriquecido/athena partition_sanity via API
  [ ] /ops/alarms estado real
"@ -ForegroundColor White

Write-Host "`nTestes automatizados: OK" -ForegroundColor Green
Write-Host "Execute w7-us12-deploy.ps1 e conclua checklist E2E para marcar E8-US12 done." -ForegroundColor Cyan
