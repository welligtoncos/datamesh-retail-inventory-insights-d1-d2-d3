# W7-US06 Validate · E8-US06 Enriquecido KPIs e comparativo M3
# Uso (repo root): .\scripts\w7-us06-validate.ps1

$ErrorActionPreference = "Stop"
$PortalDir = Join-Path $PSScriptRoot "..\portal-web" | Resolve-Path

Write-Host "=== W7 E8-US06 Portal Enriquecido Validate ===" -ForegroundColor Cyan

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

Write-Host "`n[4] Checklist manual (E8-US06):" -ForegroundColor Yellow
Write-Host @"
  [ ] ng serve → login → menu Enriquecido
  [ ] Particoes dt= visiveis (2022-01-02, 2022-01-01)
  [ ] Selecionar dt → KPIs (receita, rupturas, venda perdida)
  [ ] Preview mat-table com 20 colunas (originais + derivadas)
  [ ] Paginacao mat-paginator (50 itens/pagina, labels PT-BR)
  [ ] Comparativo dt A vs dt B com delta de KPIs
  [ ] Chip dados de demonstracao (mock ate BFF)
  [ ] Home /home ainda carrega KPIs resumo (regressao E8-US03)
  [ ] DevTools: GET /enriquecido/partitions, /kpis, /preview com Authorization
  [ ] (Opcional) deploy CloudFront

"@ -ForegroundColor White

Write-Host "Build e testes automatizados: OK" -ForegroundColor Green
Write-Host "Conclua o checklist manual para marcar E8-US06 done." -ForegroundColor Cyan
