# W7-US04 Validate · E8-US04 Listar insumos M1
# Uso (repo root): .\scripts\w7-us04-validate.ps1

$ErrorActionPreference = "Stop"
$PortalDir = Join-Path $PSScriptRoot "..\portal-web" | Resolve-Path

Write-Host "=== W7 E8-US04 Portal Insumos Validate ===" -ForegroundColor Cyan

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

Write-Host "`n[4] Checklist manual (E8-US04):" -ForegroundColor Yellow
Write-Host @"
  [ ] ng serve → login → menu Insumos
  [ ] Tabela com Nome, Tamanho, Ultima modificacao
  [ ] Notice upload fase 2 (sem botao upload)
  [ ] Ordenacao default: mais recente primeiro
  [ ] Chip dados de demonstracao (mock ate BFF)
  [ ] DevTools: GET /insumos com Authorization
  [ ] (Opcional) deploy CloudFront

"@ -ForegroundColor White

Write-Host "Build e testes automatizados: OK" -ForegroundColor Green
Write-Host "Conclua o checklist manual para marcar E8-US04 done." -ForegroundColor Cyan
