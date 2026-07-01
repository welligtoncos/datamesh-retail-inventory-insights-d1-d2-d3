# W7-US09 Validate · E8-US09 Operações pipeline M5
# Uso (repo root): .\scripts\w7-us09-validate.ps1

$ErrorActionPreference = "Stop"
$PortalDir = Join-Path $PSScriptRoot "..\portal-web" | Resolve-Path

Write-Host "=== W7 E8-US09 Portal Operações Pipeline Validate ===" -ForegroundColor Cyan

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

Write-Host "`n[4] Checklist manual (E8-US09):" -ForegroundColor Yellow
Write-Host @"
  [ ] ng serve → login → /operacoes (nao placeholder)
  [ ] Banner insight sem particao → Ir para Operacoes com ?dt= preenchido
  [ ] Selecionar dt e Processar dia → status RUNNING
  [ ] Apos ~8s mock → SUCCEEDED ou FAILED
  [ ] Historico ate 20 execucoes com duracao
  [ ] Link Console abre URL SFN (nova aba)
  [ ] Confirmacao se ja houver RUNNING
  [ ] Chip dados de demonstracao (mock ate BFF)
  [ ] Insights D-1/D-2/D-3 sem regressao
  [ ] DevTools: POST /pipeline/processar-dia e GET /pipeline/executions

"@ -ForegroundColor White

Write-Host "Build e testes automatizados: OK" -ForegroundColor Green
Write-Host "Conclua o checklist manual para marcar E8-US09 done." -ForegroundColor Cyan
