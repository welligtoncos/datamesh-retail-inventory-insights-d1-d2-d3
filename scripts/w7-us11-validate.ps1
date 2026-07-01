# W7-US11 Validate · E8-US11 Athena templates no portal M3
# Uso (repo root): .\scripts\w7-us11-validate.ps1
# Opcional: .\scripts\w7-us11-validate.ps1 -ForceCi

param(
    [switch]$ForceCi
)

$ErrorActionPreference = "Stop"
$PortalDir = Join-Path $PSScriptRoot "..\portal-web" | Resolve-Path
. (Join-Path $PSScriptRoot "w7-portal-npm-deps.ps1")

Write-Host "=== W7 E8-US11 Portal Athena Templates Validate ===" -ForegroundColor Cyan

Push-Location $PortalDir

if (-not $env:NODE_OPTIONS) {
    $env:NODE_OPTIONS = "--max-old-space-size=4096"
}

Write-Host "`n[1] Dependencias npm..." -ForegroundColor Yellow
if (-not (Install-PortalWebDeps -ForceCi:$ForceCi)) {
    Pop-Location
    exit 1
}

Write-Host "`n[2] ng build (production)..." -ForegroundColor Yellow
npm run build:prod
if ($LASTEXITCODE -ne 0) { Pop-Location; exit $LASTEXITCODE }

Write-Host "`n[3] ng test (headless, single run)..." -ForegroundColor Yellow
npm test
if ($LASTEXITCODE -ne 0) { Pop-Location; exit $LASTEXITCODE }

Pop-Location

Write-Host "`n[4] Checklist manual (E8-US11):" -ForegroundColor Yellow
Write-Host @"
  [ ] ng serve → login → /enriquecido → Consultas Athena
  [ ] /enriquecido/athena?dt=2022-01-01 abre com dt preenchido
  [ ] Lista 9 templates; sem campo SQL livre
  [ ] partition_sanity → 100 linhas, receita 879026.03 (mock)
  [ ] d1_totals → 14484 unidades (mock)
  [ ] multi_dt_coverage exige 2+ dts no form
  [ ] Chip dados de demonstracao (mock ate BFF)
  [ ] Voltar Enriquecido preserva ?dt=
  [ ] /enriquecido KPIs/preview/compare sem regressao
  [ ] Home, insights, operacoes sem regressao
  [ ] DevTools: POST /athena/query-template (mock 404 ate BFF)

"@ -ForegroundColor White

Write-Host "Build e testes automatizados: OK" -ForegroundColor Green
Write-Host "Conclua o checklist manual para marcar E8-US11 done." -ForegroundColor Cyan
