# W5 Deploy + DoD - U5 Relatorio D-1 (Excel Lambda)
# Run from repo root: .\scripts\w5-run-and-validate.ps1

param(
    [string]$DataExecucao = "2022-01-02",
    [string]$DiaDado = "2022-01-01",
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
        $null = & $venvPy -c "import pandas, pyarrow, boto3, openpyxl" 2>&1
        if ($LASTEXITCODE -eq 0) { return $venvPy }
        Write-Host "  WARN: .venv invalid, using system Python" -ForegroundColor Yellow
    }
    if (Get-Command python -ErrorAction SilentlyContinue) {
        $null = & python -c "import pandas, pyarrow, boto3, openpyxl" 2>&1
        if ($LASTEXITCODE -eq 0) { return "python" }
    }
    if (Get-Command py -ErrorAction SilentlyContinue) {
        $null = & py -3 -c "import pandas, pyarrow, boto3, openpyxl" 2>&1
        if ($LASTEXITCODE -eq 0) { return "py:-3" }
    }
    throw "Python with pandas, pyarrow, boto3, openpyxl not found"
}

function Invoke-PythonScript {
    param([string]$PyExe, [string]$ScriptPath, [string[]]$ScriptArgs)
    if ($PyExe -eq "py:-3") {
        & py -3 $ScriptPath @ScriptArgs
    } else {
        & $PyExe $ScriptPath @ScriptArgs
    }
}

Write-Host "=== W5 Deploy & Validate (D-1 Excel) ===" -ForegroundColor Cyan
Write-Host "  DATA_EXECUCAO=$DataExecucao  DIA_DADO=$DiaDado" -ForegroundColor Cyan

Write-Host "`n[0] AWS identity..." -ForegroundColor Yellow
$identity = aws sts get-caller-identity --output json | ConvertFrom-Json
Write-Host "  Account: $($identity.Account)" -ForegroundColor Green

Write-Host "`n[1] Pre-check enriquecido partition..." -ForegroundColor Yellow
$enrLs = aws s3 ls "s3://$Bucket/enriquecido/dt=$DiaDado/" --region $Region 2>$null
if ($enrLs -notmatch "data.parquet") {
    Write-Host "  FAIL: enriquecido/dt=$DiaDado/data.parquet missing - run W3/W4 first" -ForegroundColor Red
    exit 1
}
Write-Host "  [OK] enriquecido present" -ForegroundColor Green

Write-Host "`n[2] Build Lambda package..." -ForegroundColor Yellow
& (Join-Path $RepoRoot "scripts\build_lambda_reports_package.ps1")
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Push-Location $TfDir
Write-Host "`n[3] Terraform apply..." -ForegroundColor Yellow
terraform init -input=false | Out-Null
terraform apply "-var-file=dev.tfvars" -auto-approve
if ($LASTEXITCODE -ne 0) { Pop-Location; exit $LASTEXITCODE }

$fnName = terraform output -raw lambda_gerar_relatorio_d1_name
Pop-Location
Write-Host "  Lambda: $fnName" -ForegroundColor Green

Write-Host "`n[4] Invoke Lambda (gerar_relatorio_d1)..." -ForegroundColor Yellow
$payload = '{"data_execucao":"' + $DataExecucao + '","dia_dado":"' + $DiaDado + '"}'
$payloadFile = Join-Path $env:TEMP "w5-lambda-payload.json"
$payload | Out-File -FilePath $payloadFile -Encoding ascii -NoNewline
$respFile = Join-Path $env:TEMP "w5-lambda-response.json"
aws lambda invoke `
    --function-name $fnName `
    --payload "file://$payloadFile" `
    --cli-binary-format raw-in-base64-out `
    --region $Region `
    $respFile | Out-Null
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
$resp = Get-Content $respFile -Raw | ConvertFrom-Json
if ($resp.errorMessage) {
    Write-Host "  FAIL: $($resp.errorMessage)" -ForegroundColor Red
    exit 1
}
if ($resp.status -ne "OK") {
    Write-Host "  FAIL: unexpected response: $($resp | ConvertTo-Json -Compress)" -ForegroundColor Red
    exit 1
}
Write-Host "  Lambda OK -> $($resp.s3_uri)" -ForegroundColor Green
Write-Host "  produtos=$($resp.produtos) unidades=$($resp.total_unidades) receita=$($resp.total_receita)" -ForegroundColor Green

$relKey = "relatorios/D1/relatorio_D1_exec${DataExecucao}_dado${DiaDado}.xlsx"
Write-Host "`n[5] S3 relatorio D-1..." -ForegroundColor Yellow
$ls = aws s3 ls "s3://$Bucket/$relKey" --region $Region 2>$null
if (-not $ls) {
    Write-Host "  FAIL: $relKey missing" -ForegroundColor Red
    exit 1
}
Write-Host "  [OK] s3://$Bucket/$relKey" -ForegroundColor Green

Write-Host "`n[6] Paridade local vs AWS (E5-US03)..." -ForegroundColor Yellow
$localXlsx = Join-Path $RepoRoot "relatorio_D1_exec${DataExecucao}_dado${DiaDado}.xlsx"
$py = Resolve-PythonExe -Root $RepoRoot
if (-not (Test-Path $localXlsx)) {
    Write-Host "  Generating local D-1 baseline..." -ForegroundColor Yellow
    Invoke-PythonScript -PyExe $py -ScriptPath (Join-Path $RepoRoot "scripts\generate_local_d1.py") -ScriptArgs @(
        "--data-execucao", $DataExecucao,
        "--dia-dado", $DiaDado
    )
    if ($LASTEXITCODE -ne 0) { exit 1 }
}
Invoke-PythonScript -PyExe $py -ScriptPath (Join-Path $RepoRoot "scripts\compare_d1_excel.py") -ScriptArgs @(
    "--data-execucao", $DataExecucao,
    "--dia-dado", $DiaDado,
    "--bucket", $Bucket,
    "--region", $Region,
    "--local", $localXlsx
)
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "`n=== W5 DoD: CHECKS PASSED ===" -ForegroundColor Green
Write-Host "Acesso analista (E5-US02): aws s3 cp s3://$Bucket/$relKey . --region $Region"
Write-Host "Update stories E5-US01..03 and aidlc-state.md"
