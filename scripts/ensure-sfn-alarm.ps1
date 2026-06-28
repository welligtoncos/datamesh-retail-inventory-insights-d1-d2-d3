# Ensure CloudWatch alarm for SFN ExecutionsFailed (E7-US02)
# Terraform nao gerencia o alarme nesta conta (sem cloudwatch:ListTagsForResource).
param(
    [string]$Region = "us-east-1",
    [string]$ProjectName = "retail-inventory-insights",
    [string]$Environment = "dev"
)

$ErrorActionPreference = "Stop"
$AlarmName = "$ProjectName-processar-dia-failed-$Environment"
$SfnArn = aws stepfunctions list-state-machines --region $Region --output json | ConvertFrom-Json |
    ForEach-Object { $_.stateMachines } |
    Where-Object { $_.name -eq "$ProjectName-processar-dia-$Environment" } |
    Select-Object -ExpandProperty stateMachineArn

if (-not $SfnArn) { throw "State machine not found" }

$existing = aws cloudwatch describe-alarms --alarm-names $AlarmName --region $Region --output json | ConvertFrom-Json
if ($existing.MetricAlarms.Count -gt 0) {
    Write-Host "[OK] Alarm already exists: $AlarmName" -ForegroundColor Green
    exit 0
}

Write-Host "Creating alarm $AlarmName..." -ForegroundColor Yellow
aws cloudwatch put-metric-alarm `
    --alarm-name $AlarmName `
    --alarm-description "Step Functions processar_dia falhou (E7-US02)" `
    --namespace AWS/States `
    --metric-name ExecutionsFailed `
    --dimensions "Name=StateMachineArn,Value=$SfnArn" `
    --statistic Sum `
    --period 300 `
    --evaluation-periods 1 `
    --threshold 0 `
    --comparison-operator GreaterThanThreshold `
    --treat-missing-data notBreaching `
    --region $Region

Write-Host "[OK] Alarm created: $AlarmName" -ForegroundColor Green
