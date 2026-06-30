# Deploy · Portal Web Angular → S3 + CloudFront (E8-US02)

param(
    [string]$Bucket = "retail-inventory-insights-portal-web-dev-use1",
    [string]$DistributionId = "E1KJGUHSP2GWTK",
    [string]$Region = "us-east-1"
)

$ErrorActionPreference = "Stop"
$PortalDir = Join-Path $PSScriptRoot "..\portal-web" | Resolve-Path

Write-Host "=== Deploy portal-web (production build) ===" -ForegroundColor Cyan
Push-Location $PortalDir

Write-Host "npm ci..." -ForegroundColor Yellow
npm ci
if ($LASTEXITCODE -ne 0) {
    Write-Host "npm ci falhou; limpando node_modules e tentando novamente..." -ForegroundColor Yellow
    if (Test-Path node_modules) { Remove-Item -Recurse -Force node_modules }
    npm ci
    if ($LASTEXITCODE -ne 0) { Pop-Location; exit $LASTEXITCODE }
}

Write-Host "ng build (production)..." -ForegroundColor Yellow
npm run build:prod
if ($LASTEXITCODE -ne 0) { Pop-Location; exit $LASTEXITCODE }

$DistBrowser = Join-Path $PortalDir "dist\portal-web\browser"
if (-not (Test-Path $DistBrowser)) {
    throw "Build output not found: $DistBrowser"
}

Pop-Location

Write-Host "aws s3 sync -> s3://$Bucket/" -ForegroundColor Yellow
aws s3 sync $DistBrowser "s3://$Bucket/" --delete --region $Region
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "CloudFront invalidation..." -ForegroundColor Yellow
aws cloudfront create-invalidation --distribution-id $DistributionId --paths "/*" | Out-Null

Write-Host "[OK] Deploy concluido: https://d3g8ihrhzv7hsx.cloudfront.net" -ForegroundColor Green
