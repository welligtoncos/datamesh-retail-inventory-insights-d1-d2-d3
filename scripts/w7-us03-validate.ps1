# W7-US03 Validate · E8-US03 Shell Angular e home dashboard
# Uso (repo root): .\scripts\w7-us03-validate.ps1

$ErrorActionPreference = "Stop"
$PortalDir = Join-Path $PSScriptRoot "..\portal-web" | Resolve-Path

Write-Host "=== W7 E8-US03 Portal Shell Validate ===" -ForegroundColor Cyan

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

Write-Host "`n[4] Checklist manual (E8-US03):" -ForegroundColor Yellow
Write-Host @"
  [ ] ng serve em portal-web/ (http://localhost:4200)
  [ ] Login Cognito → shell com sidenav visível
  [ ] Home exibe dt + 3 KPIs + atalhos D-1/D-2/D-3
  [ ] Navegar Insumos / Origem / Enriquecido / Operações → placeholder
  [ ] Atalho D-2 navega para /insights/d2
  [ ] Badge health verde (GET /health)
  [ ] Redimensionar janela tablet → sidenav overlay + menu hamburger
  [ ] (Opcional) .\scripts\w7-deploy-portal-web.ps1 + smoke CloudFront

"@ -ForegroundColor White

Write-Host "Build e testes automatizados: OK" -ForegroundColor Green
Write-Host "Conclua o checklist manual para marcar E8-US03 done." -ForegroundColor Cyan
