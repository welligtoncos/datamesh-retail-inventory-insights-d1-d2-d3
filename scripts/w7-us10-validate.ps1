# W7-US10 Validate · E8-US10 Alarmes CloudWatch + health na home M5
# Uso (repo root): .\scripts\w7-us10-validate.ps1

$ErrorActionPreference = "Stop"
$PortalDir = Join-Path $PSScriptRoot "..\portal-web" | Resolve-Path

Write-Host "=== W7 E8-US10 Portal Ops Alarms + Health Validate ===" -ForegroundColor Cyan

Push-Location $PortalDir

Write-Host "`n[1] npm ci..." -ForegroundColor Yellow
npm ci
if ($LASTEXITCODE -ne 0) {
    Write-Host "npm ci falhou; limpando node_modules e tentando novamente..." -ForegroundColor Yellow
    if (Test-Path node_modules) { Remove-Item -Recurse -Force node_modules }
    npm ci
    if ($LASTEXITCODE -ne 0) { Pop-Location; exit $LASTEXITCODE }
}

Write-Host "`n[2] ng build (production)..." -ForegroundColor Yellow
npm run build:prod
if ($LASTEXITCODE -ne 0) { Pop-Location; exit $LASTEXITCODE }

Write-Host "`n[3] ng test (headless, single run)..." -ForegroundColor Yellow
npm test
if ($LASTEXITCODE -ne 0) { Pop-Location; exit $LASTEXITCODE }

Pop-Location

Write-Host "`n[4] Checklist manual (E8-US10):" -ForegroundColor Yellow
Write-Host @"
  [ ] ng serve → login → /home
  [ ] Card Esteira operacional (verde) com mock OK
  [ ] /home?alarm=demo → card Esteira em alarme (vermelho)
  [ ] Shell HealthBadge ainda mostra API disponivel/indisponivel
  [ ] Link Ver alarme no console abre CloudWatch (nova aba)
  [ ] Link Operacoes navega para /operacoes
  [ ] Botao Tentar novamente atualiza KPIs e card
  [ ] KPIs e atalhos D-1/D-2/D-3 sem regressao
  [ ] /operacoes pipeline E8-US09 sem regressao
  [ ] DevTools: GET /health e GET /ops/alarms (mock 404 ate BFF)

"@ -ForegroundColor White

Write-Host "Build e testes automatizados: OK" -ForegroundColor Green
Write-Host "Conclua o checklist manual para marcar E8-US10 done." -ForegroundColor Cyan
