# W4 Deploy + DoD · U4 Orquestracao (processar_dia)
# Run from repo root: .\scripts\w4-run-and-validate.ps1 [-Dts @("2022-01-01","2022-01-02","2022-01-03")]

param(
    [string[]]$Dts = @("2022-01-01", "2022-01-02", "2022-01-03"),
    [string]$Region = "us-east-1",
    [string]$Bucket = "retail-inventory-insights-dev-use1"
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path $PSScriptRoot -Parent
$TfDir = Join-Path $RepoRoot "terraform\environments\dev" | Resolve-Path

Write-Host "=== W4 Deploy & Validate (processar_dia) ===" -ForegroundColor Cyan

Write-Host "`n[0] AWS identity..." -ForegroundColor Yellow
$identity = aws sts get-caller-identity --output json | ConvertFrom-Json
Write-Host "  Account: $($identity.Account)" -ForegroundColor Green

Push-Location $TfDir
Write-Host "`n[1] Terraform apply..." -ForegroundColor Yellow
terraform init -input=false | Out-Null
terraform apply "-var-file=dev.tfvars" -auto-approve
if ($LASTEXITCODE -ne 0) { Pop-Location; exit $LASTEXITCODE }

$sfnArn = terraform output -raw sfn_processar_dia_arn
$sfnName = terraform output -raw sfn_processar_dia_name
$logGroup = terraform output -raw sfn_log_group_name
Pop-Location
Write-Host "  SFN: $sfnName" -ForegroundColor Green
Write-Host "  Logs: $logGroup" -ForegroundColor Green

Write-Host "`n[2] Rastreabilidade execucao (E4-US03)..." -ForegroundColor Yellow
if ($logGroup -and $logGroup -ne "null") {
    $lg = aws logs describe-log-groups --log-group-name-prefix $logGroup --region $Region --output json | ConvertFrom-Json
    if ($lg.logGroups.Count -lt 1) {
        Write-Host "  FAIL: log group not found" -ForegroundColor Red
        exit 1
    }
    Write-Host "  [OK] CloudWatch log group: $logGroup" -ForegroundColor Green
} else {
    Write-Host "  [OK] SFN logging disabled (dev) — use Step Functions execution history + describe-execution" -ForegroundColor Green
}

$allOk = $true
foreach ($Dt in $Dts) {
    Write-Host "`n[3] Step Functions start-execution (dt=$Dt)..." -ForegroundColor Yellow
    $inputJson = '{"dt":"' + $Dt + '"}'
    $execJson = aws stepfunctions start-execution `
        --state-machine-arn $sfnArn `
        --name "w4-validate-$Dt-$(Get-Date -Format 'yyyyMMddHHmmss')" `
        --input $inputJson `
        --region $Region `
        --output json | ConvertFrom-Json
    $execArn = $execJson.executionArn
    Write-Host "  ExecutionArn: $execArn"

    do {
        Start-Sleep -Seconds 15
        $desc = aws stepfunctions describe-execution --execution-arn $execArn --region $Region --output json | ConvertFrom-Json
        $status = $desc.status
        Write-Host "  Status: $status"
    } while ($status -eq "RUNNING")

    if ($status -ne "SUCCEEDED") {
        Write-Host "  FAIL: execution ended with $status" -ForegroundColor Red
        Write-Host "  Cause: $($desc.cause)" -ForegroundColor Red
        $allOk = $false
        continue
    }
    Write-Host "  SFN OK" -ForegroundColor Green

    Write-Host "`n[4] S3 partitions (dt=$Dt)..." -ForegroundColor Yellow
    foreach ($prefix in @("origem", "enriquecido")) {
        $ls = aws s3 ls "s3://$Bucket/$prefix/dt=$Dt/" --region $Region 2>$null
        if ($ls -notmatch "data.parquet") {
            Write-Host "  FAIL: $prefix/dt=$Dt/data.parquet missing" -ForegroundColor Red
            $allOk = $false
        } else {
            Write-Host "  [OK] $prefix/dt=$Dt/data.parquet" -ForegroundColor Green
        }
    }
}

if (-not $allOk) {
    Write-Host "`n=== W4 DoD: SOME CHECKS FAILED ===" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== W4 DoD: CHECKS PASSED (dts=$($Dts -join ', ')) ===" -ForegroundColor Green
Write-Host "Manual exec: aws stepfunctions start-execution --state-machine-arn $sfnArn --input '{`"dt`":`"YYYY-MM-DD`"}' --region $Region"
Write-Host "Update stories E4-US01..03 and aidlc-state.md"
