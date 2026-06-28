# W1 Deploy + DoD Validation · U1 Infra S3/IAM
# Run from repo root: .\scripts\w1-deploy-and-validate.ps1
# Requires: Terraform >= 1.5, AWS CLI v2, credentials with S3+IAM permissions

$ErrorActionPreference = "Stop"
$Region = "sa-east-1"
$Bucket = "retail-inventory-insights-dev"
$TfDir = Join-Path $PSScriptRoot "..\terraform\environments\dev" | Resolve-Path
$CsvPath = Join-Path $PSScriptRoot "..\retail_store_inventory.csv" | Resolve-Path

Write-Host "=== W1 Deploy & Validate ===" -ForegroundColor Cyan
Write-Host "Terraform dir: $TfDir"

# 0. Preflight AWS
Write-Host "`n[0] AWS identity..." -ForegroundColor Yellow
try {
    $identity = aws sts get-caller-identity --output json | ConvertFrom-Json
    Write-Host "  Account: $($identity.Account)  Arn: $($identity.Arn)" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: AWS credentials or system clock." -ForegroundColor Red
    Write-Host "  Fix: sync Windows time (Settings > Time > Sync now) or run as Admin:"
    Write-Host "    Start-Service w32time; w32tm /resync /force"
    Write-Host "  Then refresh SSO/session credentials if using temporary tokens."
    exit 1
}

Push-Location $TfDir

# 1. Terraform init + apply
Write-Host "`n[1] Terraform init..." -ForegroundColor Yellow
terraform init -input=false

Write-Host "`n[2] Terraform apply..." -ForegroundColor Yellow
terraform apply "-var-file=dev.tfvars" -auto-approve
if ($LASTEXITCODE -ne 0) { Pop-Location; exit $LASTEXITCODE }

terraform output -json | Out-Null
Write-Host "  Apply OK" -ForegroundColor Green

Pop-Location

# 3. Upload CSV (E1-US02)
Write-Host "`n[3] Upload insumo CSV..." -ForegroundColor Yellow
if (-not (Test-Path $CsvPath)) {
    Write-Host "  WARN: CSV not found at $CsvPath" -ForegroundColor Red
    exit 1
}
aws s3 cp $CsvPath "s3://$Bucket/insumo/retail_store_inventory.csv" --region $Region
Write-Host "  Upload OK" -ForegroundColor Green

# 4. Validation checklist
Write-Host "`n[4] W1 DoD validation..." -ForegroundColor Yellow
$ok = $true

function Assert-Ok($label, $condition) {
    if ($condition) {
        Write-Host "  [OK] $label" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] $label" -ForegroundColor Red
        script:ok = $false
    }
}

$ls = aws s3 ls "s3://$Bucket/" --recursive --region $Region 2>$null
Assert-Ok "E1-US01 prefix markers visible" ($ls -match "insumo/\.keep" -and $ls -match "origem/\.keep")

$bpa = aws s3api get-public-access-block --bucket $Bucket --region $Region 2>$null | ConvertFrom-Json
Assert-Ok "E1-US01 Block Public Access" ($bpa.PublicAccessBlockConfiguration.BlockPublicAcls -eq $true)

$enc = aws s3api get-bucket-encryption --bucket $Bucket --region $Region 2>$null | ConvertFrom-Json
Assert-Ok "E1-US01 SSE-S3 enabled" ($enc.ServerSideEncryptionConfiguration.Rules[0].ApplyServerSideEncryptionByDefault.SSEAlgorithm -eq "AES256")

$tags = aws s3api get-bucket-tagging --bucket $Bucket --region $Region 2>$null | ConvertFrom-Json
$hasProjectTag = $null -ne ($tags.TagSet | Where-Object { $_.Key -eq "Project" })
Assert-Ok "E1-US01 tags present" $hasProjectTag

$head = aws s3 cp "s3://$Bucket/insumo/retail_store_inventory.csv" - --region $Region 2>$null | Select-Object -First 1
$colCount = ($head -split ",").Count
Assert-Ok "E1-US02 CSV readable (15 cols)" ($colCount -eq 15)

foreach ($role in @("retail-inventory-glue-dev", "retail-inventory-lambda-reports-dev", "retail-inventory-sfn-dev")) {
    $r = aws iam get-role --role-name $role 2>$null | ConvertFrom-Json
    Assert-Ok "E1-US03 role $role exists" ($null -ne $r.Role)
}

$gluePolRaw = aws iam get-role-policy --role-name retail-inventory-glue-dev --policy-name retail-inventory-insights-glue-s3-dev --output json 2>$null
Assert-Ok "E1-US03 Glue no relatorios write" ($gluePolRaw -and ($gluePolRaw -notmatch "relatorios"))

Write-Host "`n[5] Example paths (E1-US04):" -ForegroundColor Yellow
Push-Location $TfDir
terraform output example_paths
Pop-Location

if ($ok) {
    Write-Host "`n=== W1 DoD: ALL CHECKS PASSED ===" -ForegroundColor Green
    Write-Host "Update stories.md checkboxes and aidlc-state.md W1 -> done"
    exit 0
} else {
    Write-Host "`n=== W1 DoD: SOME CHECKS FAILED ===" -ForegroundColor Red
    exit 1
}
