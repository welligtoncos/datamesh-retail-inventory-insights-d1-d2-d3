# W3 Deploy + DoD · U3 Enriquecido (enriquecer_dia)
# Run from repo root: .\scripts\w3-run-and-validate.ps1 [-Dt "2022-01-01"]

param(
    [string]$Dt = "2022-01-01",
    [string]$Region = "us-east-1",
    [string]$Bucket = "retail-inventory-insights-dev-use1"
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path $PSScriptRoot -Parent
$TfDir = Join-Path $RepoRoot "terraform\environments\dev" | Resolve-Path

function Resolve-PythonExe {
    param([string]$Root)
    $venvPy = Join-Path $Root ".venv\Scripts\python.exe"
    if (Test-Path $venvPy) {
        & $venvPy -c "import pandas, pyarrow, boto3, numpy" 2>$null
        if ($LASTEXITCODE -eq 0) { return $venvPy }
        Write-Host "  WARN: .venv invalid, using system Python" -ForegroundColor Yellow
    }
    if (Get-Command python -ErrorAction SilentlyContinue) {
        & python -c "import pandas, pyarrow, boto3, numpy" 2>$null
        if ($LASTEXITCODE -eq 0) { return "python" }
    }
    if (Get-Command py -ErrorAction SilentlyContinue) {
        & py -3 -c "import pandas, pyarrow, boto3, numpy" 2>$null
        if ($LASTEXITCODE -eq 0) { return "py:-3" }
    }
    throw "Python with pandas, pyarrow, boto3, numpy not found"
}

function Invoke-PythonScript {
    param([string]$PyExe, [string]$ScriptPath, [string[]]$ScriptArgs)
    if ($PyExe -eq "py:-3") {
        & py -3 $ScriptPath @ScriptArgs
    } else {
        & $PyExe $ScriptPath @ScriptArgs
    }
}

Write-Host "=== W3 Deploy & Validate (dt=$Dt) ===" -ForegroundColor Cyan

Write-Host "`n[0] AWS identity..." -ForegroundColor Yellow
$identity = aws sts get-caller-identity --output json | ConvertFrom-Json
Write-Host "  Account: $($identity.Account)" -ForegroundColor Green

Push-Location $TfDir
Write-Host "`n[1] Terraform apply..." -ForegroundColor Yellow
terraform init -input=false | Out-Null
terraform apply "-var-file=dev.tfvars" -auto-approve
if ($LASTEXITCODE -ne 0) { Pop-Location; exit $LASTEXITCODE }
$jobName = terraform output -raw glue_enriquecer_job_name
Pop-Location
Write-Host "  Job: $jobName" -ForegroundColor Green

Write-Host "`n[2] Pre-check origem partition..." -ForegroundColor Yellow
$origemLs = aws s3 ls "s3://$Bucket/origem/dt=$Dt/" --region $Region 2>$null
if ($origemLs -notmatch "data.parquet") {
    Write-Host "  FAIL: origem/dt=$Dt/data.parquet missing — run W2 first" -ForegroundColor Red
    exit 1
}
Write-Host "  [OK] origem present" -ForegroundColor Green

Write-Host "`n[3] Glue start-job-run (enriquecer_dia, dt=$Dt)..." -ForegroundColor Yellow
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

Write-Host "`n[4] S3 enriquecido partition..." -ForegroundColor Yellow
aws s3 ls "s3://$Bucket/enriquecido/dt=$Dt/" --region $Region
$ls = aws s3 ls "s3://$Bucket/enriquecido/dt=$Dt/" --region $Region 2>$null
if ($ls -notmatch "data.parquet") {
    Write-Host "  FAIL: data.parquet not found in enriquecido" -ForegroundColor Red
    exit 1
}
Write-Host "  [OK] enriquecido/data.parquet present" -ForegroundColor Green

Write-Host "`n[5] Paridade local vs AWS (E3-US03)..." -ForegroundColor Yellow
$localPath = Join-Path $RepoRoot "tabela_enriquecida\dt=$Dt\data.parquet"
$origemPath = Join-Path $RepoRoot "tabela_origem\dt=$Dt\data.parquet"
$py = Resolve-PythonExe -Root $RepoRoot
if (-not (Test-Path $localPath)) {
    Write-Host "  Generating local enriquecido baseline..." -ForegroundColor Yellow
    $genArgs = @("--dt", $Dt, "--bucket", $Bucket, "--region", $Region)
    if (Test-Path $origemPath) {
        $genArgs += @("--local-origem", $origemPath)
    }
    Invoke-PythonScript -PyExe $py -ScriptPath (Join-Path $RepoRoot "scripts\generate_local_enriquecido.py") -ScriptArgs $genArgs
    if ($LASTEXITCODE -ne 0) { exit 1 }
}
Invoke-PythonScript -PyExe $py -ScriptPath (Join-Path $RepoRoot "scripts\compare_enriquecido_parquet.py") -ScriptArgs @("--dt", $Dt, "--bucket", $Bucket, "--region", $Region, "--local", $localPath)
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "`n=== W3 DoD: CHECKS PASSED (dt=$Dt) ===" -ForegroundColor Green
Write-Host "Update stories E3-US01..03 and aidlc-state.md"
