# W6 Deploy + DoD - U6 D-2/D-3 + U7 Athena/Alarmes
# Run from repo root: .\scripts\w6-run-and-validate.ps1

param(
    [string]$DataExecucao = "2022-01-04",
    [string]$DiaDado = "2022-01-03",
    [int]$JanelaDias = 3,
    [string]$Region = "us-east-1",
    [string]$Bucket = "retail-inventory-insights-dev-use1"
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path $PSScriptRoot -Parent
$TfDir = Join-Path $RepoRoot "terraform\environments\dev" | Resolve-Path

Write-Host "=== W6 Deploy & Validate (D-2/D-3 + Athena + Alarm) ===" -ForegroundColor Cyan
Write-Host "  DATA_EXECUCAO=$DataExecucao  DIA_DADO=$DiaDado  JANELA=$JanelaDias" -ForegroundColor Cyan

Write-Host "`n[0] AWS identity..." -ForegroundColor Yellow
$identity = aws sts get-caller-identity --output json | ConvertFrom-Json
Write-Host "  Account: $($identity.Account)" -ForegroundColor Green

Write-Host "`n[1] Pre-check enriquecido dt=$DiaDado..." -ForegroundColor Yellow
$enrLs = aws s3 ls "s3://$Bucket/enriquecido/dt=$DiaDado/" --region $Region 2>$null
if ($enrLs -notmatch "data.parquet") {
    Write-Host "  WARN: enriquecido/dt=$DiaDado missing - running SFN for $DiaDado..." -ForegroundColor Yellow
    Push-Location $TfDir
    terraform init -input=false | Out-Null
    $sfnArn = terraform output -raw sfn_processar_dia_arn
    Pop-Location
    $inputJson = '{"dt":"' + $DiaDado + '"}'
    $execJson = aws stepfunctions start-execution `
        --state-machine-arn $sfnArn `
        --name "w6-prep-$DiaDado-$(Get-Date -Format 'yyyyMMddHHmmss')" `
        --input $inputJson `
        --region $Region `
        --output json | ConvertFrom-Json
    do {
        Start-Sleep -Seconds 15
        $desc = aws stepfunctions describe-execution --execution-arn $execJson.executionArn --region $Region --output json | ConvertFrom-Json
    } while ($desc.status -eq "RUNNING")
    if ($desc.status -ne "SUCCEEDED") {
        Write-Host "  FAIL: SFN prep ended $($desc.status)" -ForegroundColor Red
        exit 1
    }
    Write-Host "  [OK] SFN prepared dt=$DiaDado" -ForegroundColor Green
} else {
    Write-Host "  [OK] enriquecido present" -ForegroundColor Green
}

Write-Host "`n[2] Build Lambda reports package..." -ForegroundColor Yellow
& (Join-Path $RepoRoot "scripts\build_lambda_reports_package.ps1")
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Push-Location $TfDir
Write-Host "`n[3] Terraform apply..." -ForegroundColor Yellow
terraform init -input=false | Out-Null
terraform apply "-var-file=dev.tfvars" -auto-approve
if ($LASTEXITCODE -ne 0) { Pop-Location; exit $LASTEXITCODE }

$fnD2 = terraform output -raw lambda_gerar_relatorio_d2_name
$fnD3 = terraform output -raw lambda_gerar_relatorio_d3_name
$athenaDb = terraform output -raw athena_database_name
$athenaWg = terraform output -raw athena_workgroup_name
$alarmName = terraform output -raw sfn_failed_alarm_name
Pop-Location
Write-Host "  Lambda D-2: $fnD2" -ForegroundColor Green
Write-Host "  Lambda D-3: $fnD3" -ForegroundColor Green
Write-Host "  Athena: $athenaDb / workgroup $athenaWg" -ForegroundColor Green
Write-Host "  Alarm: $alarmName (SNS opcional: enable_sns_alerts)" -ForegroundColor Green

function Invoke-LambdaReport {
    param([string]$FnName, [string]$PayloadJson, [string]$Label)
    Write-Host "`n  Invoke $Label..." -ForegroundColor Yellow
    $payloadFile = Join-Path $env:TEMP "w6-$Label-payload.json"
    $PayloadJson | Out-File -FilePath $payloadFile -Encoding ascii -NoNewline
    $respFile = Join-Path $env:TEMP "w6-$Label-response.json"
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

Write-Host "`n[4] Lambda D-2 (E6-US01)..." -ForegroundColor Yellow
$d2Payload = '{"data_execucao":"' + $DataExecucao + '","dia_dado":"' + $DiaDado + '"}'
$d2 = Invoke-LambdaReport -FnName $fnD2 -PayloadJson $d2Payload -Label "d2"
Write-Host "  D-2 OK -> $($d2.s3_uri) (rupturas=$($d2.rupturas))" -ForegroundColor Green

$d2Key = "relatorios/D2/relatorio_D2_exec${DataExecucao}_dado${DiaDado}.xlsx"
$lsD2 = aws s3 ls "s3://$Bucket/$d2Key" --region $Region 2>$null
if (-not $lsD2) { Write-Host "  FAIL: $d2Key missing" -ForegroundColor Red; exit 1 }

Write-Host "`n[5] Lambda D-3 (E6-US02)..." -ForegroundColor Yellow
$d3Payload = '{"data_execucao":"' + $DataExecucao + '","dia_dado":"' + $DiaDado + '","janela_dias":' + $JanelaDias + '}'
$d3 = Invoke-LambdaReport -FnName $fnD3 -PayloadJson $d3Payload -Label "d3"
Write-Host ("  D-3 OK -> " + $d3.s3_uri + " pares=" + $d3.pares + " particoes=" + $d3.particoes_lidas) -ForegroundColor Green

$d3Key = "relatorios/D3/relatorio_D3_exec${DataExecucao}_dado${DiaDado}.xlsx"
$lsD3 = aws s3 ls "s3://$Bucket/$d3Key" --region $Region 2>$null
if (-not $lsD3) { Write-Host "  FAIL: $d3Key missing" -ForegroundColor Red; exit 1 }

Write-Host "`n[6] Athena query (E7-US01)..." -ForegroundColor Yellow
$queryFile = Join-Path $RepoRoot "scripts\athena-example-query.sql"
$queryPath = (Resolve-Path $queryFile).Path -replace '\\', '/'
$qExec = aws athena start-query-execution `
    --query-string "file://$queryPath" `
    --query-execution-context "Database=$athenaDb" `
    --work-group $athenaWg `
    --region $Region `
    --output json | ConvertFrom-Json
if (-not $qExec.QueryExecutionId) {
    Write-Host "  FAIL: Athena start-query failed" -ForegroundColor Red
    exit 1
}
do {
    Start-Sleep -Seconds 3
    $q = aws athena get-query-execution --query-execution-id $qExec.QueryExecutionId --region $Region --output json | ConvertFrom-Json
    $qState = $q.QueryExecution.Status.State
} while ($qState -in @("RUNNING", "QUEUED"))
if ($qState -ne "SUCCEEDED") {
    Write-Host "  FAIL: Athena query $qState - $($q.QueryExecution.Status.StateChangeReason)" -ForegroundColor Red
    exit 1
}
Write-Host "  Athena OK (QueryExecutionId=$($qExec.QueryExecutionId))" -ForegroundColor Green

Write-Host "`n[7] CloudWatch alarm (E7-US02)..." -ForegroundColor Yellow
& (Join-Path $RepoRoot "scripts\ensure-sfn-alarm.ps1") -Region $Region | Out-Null
$alarm = aws cloudwatch describe-alarms --alarm-names $alarmName --region $Region --output json | ConvertFrom-Json
if ($alarm.MetricAlarms.Count -lt 1) {
    Write-Host "  FAIL: alarm $alarmName not found" -ForegroundColor Red
    exit 1
}
Write-Host "  [OK] alarm configured" -ForegroundColor Green

Write-Host "`n=== W6 DoD: CHECKS PASSED ===" -ForegroundColor Green
Write-Host "D-2: aws s3 cp s3://$Bucket/$d2Key . --region $Region"
Write-Host "D-3: aws s3 cp s3://$Bucket/$d3Key . --region $Region"
Write-Host "Update stories E6-US01..02, E7-US01..02 and aidlc-state.md"
