# W7-US07 Validate · E8-US07 Dashboard insight D-1 M4
# Uso (repo root): .\scripts\w7-us07-validate.ps1

$ErrorActionPreference = "Stop"
$PortalDir = Join-Path $PSScriptRoot "..\portal-web" | Resolve-Path

Write-Host "=== W7 E8-US07 Portal Insights D-1 Validate ===" -ForegroundColor Cyan

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

Write-Host "`n[4] Checklist manual (E8-US07):" -ForegroundColor Yellow
Write-Host @"
  [ ] ng serve → login → Home → atalho D-1 (<= 3 cliques)
  [ ] /insights/d1 abre dashboard (nao placeholder)
  [ ] Default dt = 2022-01-01 (ontem relativo ao mock)
  [ ] Insight textual com produto lider e top 3 %
  [ ] Tabela ranking: produto, categoria, unid., receita, % total
  [ ] Paginacao mat-paginator PT-BR
  [ ] Baixar Excel → snackbar com filename (mock ate BFF)
  [ ] Selecionar dt sem particao (ex. manual) → banner + CTA Operacoes
  [ ] Chip dados de demonstracao (mock ate BFF)
  [ ] Home /enriquecido /origem sem regressao
  [ ] DevTools: GET /insights/d1?dt= e /insights/d1/download?dt= com Authorization

"@ -ForegroundColor White

Write-Host "Build e testes automatizados: OK" -ForegroundColor Green
Write-Host "Conclua o checklist manual para marcar E8-US07 done." -ForegroundColor Cyan
