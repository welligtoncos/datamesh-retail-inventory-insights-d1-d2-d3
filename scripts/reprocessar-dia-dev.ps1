# Reprocessamento manual (eng. dados) quando a esteira diaria falha ou falta relatorio.
# Run from repo root:
#   .\scripts\reprocessar-dia-dev.ps1 -DiaDado "2022-01-03" -SomenteD1
#   .\scripts\reprocessar-dia-dev.ps1 -DiaDado "2022-01-03"

param(
    [Parameter(Mandatory = $true)]
    [Alias("Dt")]
    [string]$DiaDado,
    [switch]$SomenteD1,
    [int]$JanelaD3 = 7,
    [string]$Region = "us-east-1",
    [string]$Bucket = "retail-inventory-insights-dev-use1"
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path $PSScriptRoot -Parent
$TfDir = Join-Path $RepoRoot "terraform\environments\dev" | Resolve-Path

$dataExec = ([datetime]$DiaDado).AddDays(1).ToString("yyyy-MM-dd")

function Test-Partition {
    param([string]$Prefix, [string]$Dt)
    $ls = aws s3 ls "s3://$Bucket/$Prefix/dt=$Dt/" --region $Region 2>$null
    return ($ls -match "data.parquet")
}

function Test-Report {
    param([string]$Tipo, [string]$Exec, [string]$Dado)
    $key = "relatorios/$Tipo/relatorio_${Tipo}_exec${Exec}_dado${Dado}.xlsx"
    $ls = aws s3 ls "s3://$Bucket/$key" --region $Region 2>$null
    return [bool]$ls
}

function Wait-Sfn {
    param([string]$ExecArn)
    do {
        Start-Sleep -Seconds 15
        $desc = aws stepfunctions describe-execution --execution-arn $ExecArn --region $Region --output json | ConvertFrom-Json
        Write-Host "    SFN: $($desc.status)"
    } while ($desc.status -eq "RUNNING")
    return $desc
}

function Invoke-Report {
    param([string]$Fn, [string]$Payload, [string]$Label)
    $pf = Join-Path $env:TEMP "reproc-$Label-payload.json"
    $Payload | Out-File $pf -Encoding ascii -NoNewline
    $out = Join-Path $env:TEMP "reproc-$Label-out.json"
    aws lambda invoke --function-name $Fn --payload "file://$pf" `
        --cli-binary-format raw-in-base64-out --region $Region $out | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "Lambda $Label falhou" }
    $resp = Get-Content $out -Raw | ConvertFrom-Json
    if ($resp.errorMessage) { throw $resp.errorMessage }
    if ($resp.status -ne "OK") { throw "Resposta inesperada de $Label" }
    return $resp
}

Write-Host "=== Reprocessar dia (dev) ===" -ForegroundColor Cyan
Write-Host "  dia_dado      : $DiaDado" -ForegroundColor Cyan
Write-Host "  data_execucao : $dataExec" -ForegroundColor Cyan
Write-Host "  modo          : $(if ($SomenteD1) { 'Somente D-1' } else { 'Esteira + relatorios' })" -ForegroundColor Cyan

Push-Location $TfDir
terraform init -input=false | Out-Null
$sfnArn = terraform output -raw sfn_processar_dia_arn
$fnD1 = terraform output -raw lambda_gerar_relatorio_d1_name
$fnD2 = terraform output -raw lambda_gerar_relatorio_d2_name
$fnD3 = terraform output -raw lambda_gerar_relatorio_d3_name
Pop-Location

$hasEnr = Test-Partition -Prefix "enriquecido" -Dt $DiaDado
$hasOrig = Test-Partition -Prefix "origem" -Dt $DiaDado

Write-Host "`n[1] Diagnostico" -ForegroundColor Yellow
Write-Host "  origem/dt=$DiaDado      : $(if ($hasOrig) { 'OK' } else { 'FALTANDO' })"
Write-Host "  enriquecido/dt=$DiaDado : $(if ($hasEnr) { 'OK' } else { 'FALTANDO' })"
Write-Host "  D-1 no S3               : $(if (Test-Report -Tipo 'D1' -Exec $dataExec -Dado $DiaDado) { 'OK' } else { 'FALTANDO' })"

if ($SomenteD1) {
    if (-not $hasEnr) {
        Write-Host "`nFAIL: enriquecido ausente — rode sem -SomenteD1 para executar a SFN primeiro." -ForegroundColor Red
        exit 1
    }
    Write-Host "`n[2] Reprocessar D-1..." -ForegroundColor Yellow
    $base = '{"data_execucao":"' + $dataExec + '","dia_dado":"' + $DiaDado + '"}'
    $r1 = Invoke-Report -Fn $fnD1 -Payload $base -Label "d1"
    Write-Host "  OK -> $($r1.s3_uri)" -ForegroundColor Green
    Write-Host "`n=== REPROCESSAMENTO OK (D-1) ===" -ForegroundColor Green
    exit 0
}

if (-not $hasEnr) {
    Write-Host "`n[2] SFN processar_dia (origem + enriquecido)..." -ForegroundColor Yellow
    $inputJson = '{"dt":"' + $DiaDado + '"}'
    $execJson = aws stepfunctions start-execution `
        --state-machine-arn $sfnArn `
        --name "reproc-$DiaDado-$(Get-Date -Format 'yyyyMMddHHmmss')" `
        --input $inputJson `
        --region $Region `
        --output json | ConvertFrom-Json
    $desc = Wait-Sfn -ExecArn $execJson.executionArn
    if ($desc.status -ne "SUCCEEDED") {
        Write-Host "FAIL: SFN $($desc.status)" -ForegroundColor Red
        exit 1
    }
    Write-Host "  [OK] esteira dt=$DiaDado" -ForegroundColor Green
} else {
    Write-Host "`n[2] SFN ignorada (enriquecido ja existe)" -ForegroundColor DarkGray
}

Write-Host "`n[3] Relatorios faltantes..." -ForegroundColor Yellow
$base = '{"data_execucao":"' + $dataExec + '","dia_dado":"' + $DiaDado + '"}'
$d3Payload = '{"data_execucao":"' + $dataExec + '","dia_dado":"' + $DiaDado + '","janela_dias":' + $JanelaD3 + '}'

foreach ($item in @(
    @{ T = "D1"; Fn = $fnD1; P = $base },
    @{ T = "D2"; Fn = $fnD2; P = $base },
    @{ T = "D3"; Fn = $fnD3; P = $d3Payload }
)) {
    if (Test-Report -Tipo $item.T -Exec $dataExec -Dado $DiaDado) {
        Write-Host "  $($item.T) ja existe — skip" -ForegroundColor DarkGray
        continue
    }
    Write-Host "  Gerando $($item.T)..." -ForegroundColor Yellow
    $r = Invoke-Report -Fn $item.Fn -Payload $item.P -Label $item.T.ToLower()
    Write-Host "  $($item.T) OK -> $($r.s3_uri)" -ForegroundColor Green
}

Write-Host "`n=== REPROCESSAMENTO OK ===" -ForegroundColor Green
