# W7-US05 Validate · E8-US05 Partições origem e preview M2
# Uso (repo root): .\scripts\w7-us05-validate.ps1

$ErrorActionPreference = "Stop"
$PortalDir = Join-Path $PSScriptRoot "..\portal-web" | Resolve-Path

Write-Host "=== W7 E8-US05 Portal Origem Validate ===" -ForegroundColor Cyan

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

Write-Host "`n[4] Checklist manual (E8-US05):" -ForegroundColor Yellow
Write-Host @"
  [ ] ng serve → login → menu Origem
  [ ] Particoes dt= visiveis (2022-01-01 disponivel)
  [ ] Chip dt=2022-01-02 sem particao (warn, nao clicavel)
  [ ] Selecionar dt → KPIs (linhas, lojas, produtos)
  [ ] Preview mat-table com 15 colunas SCHEMA
  [ ] Paginacao mat-paginator (50 itens/pagina, labels PT-BR)
  [ ] Chip dados de demonstracao (mock ate BFF)
  [ ] DevTools: GET /origem/partitions e /preview com Authorization
  [ ] (Opcional) deploy CloudFront

"@ -ForegroundColor White

Write-Host "Build e testes automatizados: OK" -ForegroundColor Green
Write-Host "Conclua o checklist manual para marcar E8-US05 done." -ForegroundColor Cyan
