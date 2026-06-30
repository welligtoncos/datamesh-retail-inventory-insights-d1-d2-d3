# W7-US02 Validate · E8-US02 Login Cognito Angular
# Uso (repo root): .\scripts\w7-us02-validate.ps1

$ErrorActionPreference = "Stop"
$PortalDir = Join-Path $PSScriptRoot "..\portal-web" | Resolve-Path

Write-Host "=== W7 E8-US02 Portal Web Validate ===" -ForegroundColor Cyan

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

Write-Host "`n[4] Checklist manual (E8-US02):" -ForegroundColor Yellow
Write-Host @"
  [ ] ng serve em portal-web/ (http://localhost:4200)
  [ ] Login Cognito com teste@empresa.com
  [ ] Redireciona para /home com email visivel
  [ ] DevTools: GET API com header Authorization
  [ ] Logout limpa sessao e volta ao login
  [ ] (Opcional) .\scripts\w7-deploy-portal-web.ps1 + teste CloudFront

"@ -ForegroundColor White

Write-Host "Build e testes automatizados: OK" -ForegroundColor Green
Write-Host "Conclua o checklist manual para marcar E8-US02 done." -ForegroundColor Cyan
