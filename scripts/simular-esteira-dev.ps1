# Simula operacao diaria da esteira (dev/demo): SFN backfill + D-1/D-2/D-3 + download opcional
# Run from repo root: .\scripts\simular-esteira-dev.ps1

param(
    [string]$DiaInicio = "2022-01-01",
    [string]$DiaFim = "2022-01-07",
    [int]$JanelaD3 = 7,
    [string]$Region = "us-east-1",
    [string]$Bucket = "retail-inventory-insights-dev-use1",
    [switch]$SkipBackfill,
    [switch]$SkipReports,
    [switch]$SkipTerraform,
    [switch]$SkipDownload,
    [string]$DownloadDir = "demo-esteira-dev"
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path $PSScriptRoot -Parent
$TfDir = Join-Path $RepoRoot "terraform\environments\dev" | Resolve-Path

function Get-DateRange {
    param([string]$Start, [string]$End)
    $dates = @()
    $d = [datetime]$Start
    $last = [datetime]$End
    while ($d -le $last) {
        $dates += $d.ToString("yyyy-MM-dd")
        $d = $d.AddDays(1)
    }
    return $dates
}

function Wait-SfnExecution {
    param([string]$ExecArn)
    do {
        Start-Sleep -Seconds 15
        $desc = aws stepfunctions describe-execution --execution-arn $ExecArn --region $Region --output json | ConvertFrom-Json
        Write-Host "    Status: $($desc.status)"
    } while ($desc.status -eq "RUNNING")
    return $desc
}

function Invoke-LambdaReport {
    param([string]$FnName, [string]$PayloadJson, [string]$Label)
    $payloadFile = Join-Path $env:TEMP "sim-$Label-payload.json"
    $PayloadJson | Out-File -FilePath $payloadFile -Encoding ascii -NoNewline
    $respFile = Join-Path $env:TEMP "sim-$Label-response.json"
    aws lambda invoke `
        --function-name $FnName `
        --payload "file://$payloadFile" `
        --cli-binary-format raw-in-base64-out `
        --region $Region `
        $respFile | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "Lambda invoke failed: $Label" }
    $resp = Get-Content $respFile -Raw | ConvertFrom-Json
    if ($resp.errorMessage) { throw $resp.errorMessage }
    if ($resp.status -ne "OK") { throw "Unexpected response from $Label" }
    return $resp
}

$diasDado = Get-DateRange -Start $DiaInicio -End $DiaFim
$ultimoDado = $diasDado[-1]
$dataExecUltimo = ([datetime]$ultimoDado).AddDays(1).ToString("yyyy-MM-dd")

Write-Host "=== Simular esteira (dev) ===" -ForegroundColor Cyan
Write-Host "  Dias dado: $($diasDado -join ', ')" -ForegroundColor Cyan
Write-Host "  Ultimo ciclo: exec=$dataExecUltimo dado=$ultimoDado janelaD3=$JanelaD3" -ForegroundColor Cyan

Write-Host "`n[0] AWS identity..." -ForegroundColor Yellow
$identity = aws sts get-caller-identity --output json | ConvertFrom-Json
Write-Host "  Account: $($identity.Account)" -ForegroundColor Green

if (-not $SkipTerraform) {
    Write-Host "`n[1] Build Lambda package + terraform apply..." -ForegroundColor Yellow
    & (Join-Path $RepoRoot "scripts\build_lambda_reports_package.ps1")
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    Push-Location $TfDir
    terraform init -input=false | Out-Null
    terraform apply "-var-file=dev.tfvars" -auto-approve
    if ($LASTEXITCODE -ne 0) { Pop-Location; exit $LASTEXITCODE }
    Pop-Location
} else {
    Write-Host "`n[1] Skip terraform (SkipTerraform)" -ForegroundColor Yellow
}

Push-Location $TfDir
terraform init -input=false | Out-Null
$sfnArn = terraform output -raw sfn_processar_dia_arn
$fnD1 = terraform output -raw lambda_gerar_relatorio_d1_name
$fnD2 = terraform output -raw lambda_gerar_relatorio_d2_name
$fnD3 = terraform output -raw lambda_gerar_relatorio_d3_name
Pop-Location

$allOk = $true

if (-not $SkipBackfill) {
    Write-Host "`n[2] Backfill SFN processar_dia ($($diasDado.Count) dias)..." -ForegroundColor Yellow
    foreach ($dt in $diasDado) {
        $enrLs = aws s3 ls "s3://$Bucket/enriquecido/dt=$dt/" --region $Region 2>$null
        if ($enrLs -match "data.parquet") {
            Write-Host "  [SKIP] enriquecido/dt=$dt ja existe" -ForegroundColor DarkGray
            continue
        }
        Write-Host "  SFN dt=$dt..." -ForegroundColor Yellow
        $inputJson = '{"dt":"' + $dt + '"}'
        $execJson = aws stepfunctions start-execution `
            --state-machine-arn $sfnArn `
            --name "sim-dev-$dt-$(Get-Date -Format 'yyyyMMddHHmmss')" `
            --input $inputJson `
            --region $Region `
            --output json | ConvertFrom-Json
        $desc = Wait-SfnExecution -ExecArn $execJson.executionArn
        if ($desc.status -ne "SUCCEEDED") {
            Write-Host "  FAIL: dt=$dt -> $($desc.status)" -ForegroundColor Red
            $allOk = $false
        } else {
            Write-Host "  [OK] dt=$dt" -ForegroundColor Green
        }
    }
} else {
    Write-Host "`n[2] Skip backfill (SkipBackfill)" -ForegroundColor Yellow
}

if (-not $SkipReports) {
    Write-Host "`n[3] Gerar relatorios D-1/D-2/D-3 por dia..." -ForegroundColor Yellow
    foreach ($diaDado in $diasDado) {
        $dataExec = ([datetime]$diaDado).AddDays(1).ToString("yyyy-MM-dd")
        Write-Host "  exec=$dataExec dado=$diaDado" -ForegroundColor Cyan
        $base = '{"data_execucao":"' + $dataExec + '","dia_dado":"' + $diaDado + '"}'
        $d3Payload = '{"data_execucao":"' + $dataExec + '","dia_dado":"' + $diaDado + '","janela_dias":' + $JanelaD3 + '}'
        try {
            $r1 = Invoke-LambdaReport -FnName $fnD1 -PayloadJson $base -Label "d1-$diaDado"
            Write-Host "    D-1 OK produtos=$($r1.produtos)" -ForegroundColor Green
            $r2 = Invoke-LambdaReport -FnName $fnD2 -PayloadJson $base -Label "d2-$diaDado"
            Write-Host "    D-2 OK rupturas=$($r2.rupturas)" -ForegroundColor Green
            $r3 = Invoke-LambdaReport -FnName $fnD3 -PayloadJson $d3Payload -Label "d3-$diaDado"
            Write-Host "    D-3 OK pares=$($r3.pares) particoes=$($r3.particoes_lidas)" -ForegroundColor Green
        } catch {
            Write-Host "    FAIL: $_" -ForegroundColor Red
            $allOk = $false
        }
    }
} else {
    Write-Host "`n[3] Skip reports (SkipReports)" -ForegroundColor Yellow
}

Write-Host "`n[4] Resumo particoes enriquecido..." -ForegroundColor Yellow
& (Join-Path $RepoRoot "scripts\list-partitions.ps1") -DiaInicio $DiaInicio -DiaFim $DiaFim -Layer enriquecido -Region $Region -Bucket $Bucket

if (-not $SkipDownload) {
    Write-Host "`n[5] Download ultimo dia ($dataExecUltimo / $ultimoDado)..." -ForegroundColor Yellow
    $dest = Join-Path $RepoRoot $DownloadDir
    New-Item -ItemType Directory -Force -Path $dest | Out-Null
    foreach ($tipo in @("D1", "D2", "D3")) {
        $key = "relatorios/$tipo/relatorio_${tipo}_exec${dataExecUltimo}_dado${ultimoDado}.xlsx"
        aws s3 cp "s3://$Bucket/$key" $dest\ --region $Region
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  WARN: missing $key" -ForegroundColor Yellow
            $allOk = $false
        }
    }
    Write-Host "  Pasta: $dest" -ForegroundColor Green
}

if (-not $allOk) {
    Write-Host "`n=== SIMULACAO: ALGUNS CHECKS FALHARAM ===" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== SIMULACAO DEV: OK ===" -ForegroundColor Green
Write-Host "Proximo: .\scripts\w6-run-and-validate.ps1 -DataExecucao $dataExecUltimo -DiaDado $ultimoDado -JanelaDias $JanelaD3"
