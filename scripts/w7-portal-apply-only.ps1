# Apply APENAS modulo portal W7 — evita refresh das Lambdas (sem lambda:GetFunction).
# Use quando usuario-dados nao tem permissao Lambda mas precisa subir E8-US01.
#
# Uso: .\scripts\w7-portal-apply-only.ps1

$ErrorActionPreference = "Stop"
$TfDir = Join-Path $PSScriptRoot "..\terraform\environments\dev" | Resolve-Path

Write-Host "=== W7 Portal apply (target module.portal, refresh=false) ===" -ForegroundColor Cyan
Write-Host "Nao atualiza Lambdas D-1/D-2/D-3 — apenas infra portal E8-US01" -ForegroundColor Yellow

Push-Location $TfDir
terraform init -input=false
if ($LASTEXITCODE -ne 0) { Pop-Location; exit $LASTEXITCODE }

terraform plan `
    "-var-file=dev.tfvars" `
    -target="module.portal[0]" `
    -refresh=false `
    -out=tfplan-portal-only

if ($LASTEXITCODE -ne 0) { Pop-Location; exit $LASTEXITCODE }

terraform apply -auto-approve tfplan-portal-only
$code = $LASTEXITCODE
Pop-Location

if ($code -eq 0) {
    Write-Host "`n[OK] Portal apply concluido. Outputs:" -ForegroundColor Green
    Push-Location $TfDir
    terraform output portal_cloudfront_url portal_api_gateway_url portal_cognito_user_pool_id portal_cognito_client_id 2>$null
    Pop-Location
}
exit $code
