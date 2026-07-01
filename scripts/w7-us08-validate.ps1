# W7-US08 Validate · E8-US08 Dashboard insights D-2 e D-3 M4
# Uso (repo root): .\scripts\w7-us08-validate.ps1

$ErrorActionPreference = "Stop"
$PortalDir = Join-Path $PSScriptRoot "..\portal-web" | Resolve-Path

Write-Host "=== W7 E8-US08 Portal Insights D-2/D-3 Validate ===" -ForegroundColor Cyan

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

Write-Host "`n[4] Checklist manual (E8-US08):" -ForegroundColor Yellow
Write-Host @"
  [ ] ng serve → login → Home → atalhos D-2 e D-3 (<= 3 cliques)
  [ ] /insights/d2 abre dashboard ruptura (nao placeholder)
  [ ] dt=2022-01-01 → zero rupturas + insight textual
  [ ] dt=2022-01-02 → tabela rupturas ordenada por perdidas desc
  [ ] Painel insight D-2 tema vermelho
  [ ] Baixar Excel D-2 → snackbar com filename (mock ate BFF)
  [ ] /insights/d3 abre dashboard tendencia (nao placeholder)
  [ ] Seletor janela 3/7/14 dias (default 7) + query ?window=
  [ ] Tabela tendencia: media uteis, media FDS, variacao, label Subindo/Caindo/Estavel
  [ ] Painel insight D-3 tema verde
  [ ] Baixar Excel D-3 → snackbar com filename
  [ ] Particao ausente → banner + CTA Operacoes (D-2 e D-3)
  [ ] /insights/d1 regressao (shared components, ranking inalterado)
  [ ] Home /enriquecido /origem sem regressao
  [ ] Chip dados de demonstracao (mock ate BFF)
  [ ] DevTools: GET /insights/d2, /d2/download, /d3?window=, /d3/download

"@ -ForegroundColor White

Write-Host "Build e testes automatizados: OK (79 specs)" -ForegroundColor Green
Write-Host "Conclua o checklist manual para marcar E8-US08 done." -ForegroundColor Cyan
