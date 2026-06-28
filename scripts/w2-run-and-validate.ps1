# W2 Deploy + DoD · U2 Origem (carregar_origem_dia)
# Run from repo root: .\scripts\w2-run-and-validate.ps1 [-Dt "2022-01-01"]

param(
    [string]$Dt = "2022-01-01",
    [string]$Region = "sa-east-1",
    [string]$Bucket = "retail-inventory-insights-dev"
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path $PSScriptRoot -Parent
$TfDir = Join-Path $RepoRoot "terraform\environments\dev" | Resolve-Path

Write-Host "=== W2 Deploy & Validate (dt=$Dt) ===" -ForegroundColor Cyan

# 0. AWS
Write-Host "`n[0] AWS identity..." -ForegroundColor Yellow
$identity = aws sts get-caller-identity --output json | ConvertFrom-Json
Write-Host "  Account: $($identity.Account)" -ForegroundColor Green

# 1. Terraform apply (Glue job + script)
Push-Location $TfDir
Write-Host "`n[1] Terraform apply..." -ForegroundColor Yellow
terraform init -input=false | Out-Null
terraform apply "-var-file=dev.tfvars" -auto-approve
if ($LASTEXITCODE -ne 0) { Pop-Location; exit $LASTEXITCODE }

$jobName = terraform output -raw glue_carregar_origem_job_name
Pop-Location
Write-Host "  Job: $jobName" -ForegroundColor Green

# 2. Run Glue job
Write-Host "`n[2] Glue start-job-run (dt=$Dt)..." -ForegroundColor Yellow
$argsJson = '{"--dt":"' + $Dt + '"}'
$runJson = aws glue start-job-run `
    --job-name $jobName `
    --arguments $argsJson `
    --region $Region `
    --output json | ConvertFrom-Json

$runId = $runJson.JobRunId
Write-Host "  RunId: $runId"

do {
    Start-Sleep -Seconds 10
    $status = aws glue get-job-run --job-name $jobName --run-id $runId --region $Region --output json | ConvertFrom-Json
    $state = $status.JobRun.JobRunState
    Write-Host "  State: $state"
} while ($state -in @("STARTING", "RUNNING", "STOPPING"))

if ($state -ne "SUCCEEDED") {
    Write-Host "  FAIL: Glue job ended with $state" -ForegroundColor Red
    exit 1
}
Write-Host "  Glue OK" -ForegroundColor Green

# 3. S3 output check
Write-Host "`n[3] S3 origem partition..." -ForegroundColor Yellow
aws s3 ls "s3://$Bucket/origem/dt=$Dt/" --region $Region
$ls = aws s3 ls "s3://$Bucket/origem/dt=$Dt/" --region $Region 2>$null
if ($ls -notmatch "data.parquet") {
    Write-Host "  FAIL: data.parquet not found" -ForegroundColor Red
    exit 1
}
Write-Host "  [OK] data.parquet present" -ForegroundColor Green

# 4. Parity vs local (E2-US03) — requires local partition from notebook
Write-Host "`n[4] Paridade local vs AWS (E2-US03)..." -ForegroundColor Yellow
$localPath = Join-Path $RepoRoot "tabela_origem\dt=$Dt\data.parquet"
if (-not (Test-Path $localPath)) {
    Write-Host "  Generating local baseline from S3 insumo..." -ForegroundColor Yellow
    $py = Join-Path $RepoRoot ".venv\Scripts\python.exe"
    if (-not (Test-Path $py)) { $py = "python" }
    & $py (Join-Path $RepoRoot "scripts\generate_local_origem.py") --dt $Dt --bucket $Bucket --region $Region
    if ($LASTEXITCODE -ne 0) { exit 1 }
}
$py = Join-Path $RepoRoot ".venv\Scripts\python.exe"
if (-not (Test-Path $py)) { $py = "python" }
& $py (Join-Path $RepoRoot "scripts\compare_origem_parquet.py") --dt $Dt --bucket $Bucket --region $Region --local $localPath
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "`n=== W2 DoD: CHECKS PASSED (dt=$Dt) ===" -ForegroundColor Green
Write-Host "Update stories E2-US01..03 and aidlc-state.md"
