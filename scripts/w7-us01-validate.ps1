# W7-US01 Deploy + Validate · E8-US01 Infra Terraform Portal
# Run from repo root: .\scripts\w7-us01-validate.ps1
# Requires: Terraform >= 1.5, AWS CLI v2, credentials (portal + existing datamesh perms)

$ErrorActionPreference = "Stop"
$Region = "us-east-1"
$TfDir = Join-Path $PSScriptRoot "..\terraform\environments\dev" | Resolve-Path

Write-Host "=== W7 E8-US01 Portal Infra Deploy & Validate ===" -ForegroundColor Cyan

Write-Host "`n[0a] IAM portal deploy policy..." -ForegroundColor Yellow
& (Join-Path $PSScriptRoot "iam-verify-portal-permissions.ps1")
if ($LASTEXITCODE -ne 0) {
    Write-Host "  Anexe a política: .\scripts\iam-attach-portal-deploy-policy.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n[0] AWS identity..." -ForegroundColor Yellow
try {
    $identity = aws sts get-caller-identity --output json | ConvertFrom-Json
    Write-Host "  Account: $($identity.Account)" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: AWS credentials unavailable." -ForegroundColor Red
    exit 1
}

Push-Location $TfDir

Write-Host "`n[1] Terraform init..." -ForegroundColor Yellow
terraform init -input=false
if ($LASTEXITCODE -ne 0) { Pop-Location; exit $LASTEXITCODE }

Write-Host "`n[2] Terraform plan..." -ForegroundColor Yellow
terraform plan "-var-file=dev.tfvars" -out=tfplan-w7-us01
if ($LASTEXITCODE -ne 0) { Pop-Location; exit $LASTEXITCODE }

Write-Host "`n[3] Terraform apply..." -ForegroundColor Yellow
terraform apply -auto-approve tfplan-w7-us01
if ($LASTEXITCODE -ne 0) { Pop-Location; exit $LASTEXITCODE }

$outputs = terraform output -json | ConvertFrom-Json
Pop-Location

$ok = $true
function Assert-Ok($label, $condition) {
    if ($condition) {
        Write-Host "  [OK] $label" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] $label" -ForegroundColor Red
        $script:ok = $false
    }
}

Write-Host "`n[4] E8-US01 acceptance checks..." -ForegroundColor Yellow

Assert-Ok "cognito_user_pool_id output" ($null -ne $outputs.portal_cognito_user_pool_id.value)
Assert-Ok "cognito_client_id output" ($null -ne $outputs.portal_cognito_client_id.value)
Assert-Ok "cloudfront_url output" ($outputs.portal_cloudfront_url.value -match "^https://")
Assert-Ok "api_gateway_url output" ($outputs.portal_api_gateway_url.value -match "^https://")

$poolId = $outputs.portal_cognito_user_pool_id.value
if ($poolId) {
    $pool = aws cognito-idp describe-user-pool --user-pool-id $poolId --region $Region 2>$null | ConvertFrom-Json
    Assert-Ok "Cognito User Pool exists" ($null -ne $pool.UserPool)
}

$cfUrl = $outputs.portal_cloudfront_url.value
if ($cfUrl) {
    try {
        $resp = Invoke-WebRequest -Uri $cfUrl -UseBasicParsing -TimeoutSec 30
        Assert-Ok "CloudFront serves placeholder HTML" ($resp.StatusCode -eq 200)
    } catch {
        Assert-Ok "CloudFront serves placeholder HTML" $false
    }
}

$apiUrl = $outputs.portal_api_gateway_url.value.TrimEnd("/")
if ($apiUrl) {
  # Placeholder nginx has no /health — ALB root returns 200; API /health may 404 until FastAPI (E8-US12)
    try {
        $albTest = Invoke-WebRequest -Uri "$apiUrl/health" -UseBasicParsing -TimeoutSec 15 -SkipHttpErrorCheck
        Assert-Ok "API Gateway reachable (/health proxy)" ($albTest.StatusCode -in 200, 403, 404)
    } catch {
        Assert-Ok "API Gateway reachable" $false
    }
}

$cluster = $outputs.portal_ecs_cluster_name.value
if ($cluster) {
    $svc = aws ecs describe-services --cluster $cluster --services "rii-portal-dev-service" --region $Region 2>$null | ConvertFrom-Json
    $running = $svc.services[0].runningCount -ge 1
    Assert-Ok "ECS service has running task" $running
}

Write-Host "`n=== Summary ===" -ForegroundColor Cyan
if ($ok) {
    Write-Host "E8-US01 validation PASSED" -ForegroundColor Green
    Write-Host "  CloudFront: $($outputs.portal_cloudfront_url.value)"
    Write-Host "  API GW:     $($outputs.portal_api_gateway_url.value)"
    Write-Host "  Cognito:    pool=$poolId client=$($outputs.portal_cognito_client_id.value)"
    exit 0
} else {
    Write-Host "E8-US01 validation FAILED — review output above" -ForegroundColor Red
    exit 1
}
