# Verifica políticas IAM completas do Datamesh para terraform apply (W1-W7).
#
# Uso:
#   .\scripts\iam-verify-datamesh-policies.ps1
#   .\scripts\iam-verify-datamesh-policies.ps1 -Mode unified

param(
    [string]$IamUser = "usuario-dados",
    [ValidateSet("complete", "modular", "unified")]
    [string]$Mode = "complete",
    [string]$Region = "us-east-1"
)

$ErrorActionPreference = "Stop"
$AccountId = (aws sts get-caller-identity --query Account --output text)
$UserArn = "arn:aws:iam::${AccountId}:user/$IamUser"

$RequiredByMode = @{
    complete = @("DatameshTerraformCompleteA", "DatameshTerraformCompleteB")
    modular  = @(
        "Datamesh01StorageGlueAthenaDev",
        "Datamesh02LambdaSfnEventsDev",
        "Datamesh03IamLogsMonitoringDev",
        "Datamesh04PortalEdgeDev"
    )
    unified  = @("DatameshTerraformOperatorDev")
}

$RequiredPolicies = $RequiredByMode[$Mode]

Write-Host "=== Verificação IAM Datamesh completo ===" -ForegroundColor Cyan
Write-Host "User: $UserArn | Modo: $Mode | Região: $Region"

# --- Políticas anexadas ---
$attached = aws iam list-attached-user-policies --user-name $IamUser --output json | ConvertFrom-Json
$attachedNames = $attached.AttachedPolicies | ForEach-Object {
    ($_.PolicyArn -split "/")[-1]
}

$missing = @()
foreach ($name in $RequiredPolicies) {
    if ($attachedNames -contains $name) {
        Write-Host "[OK] $name anexada" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] $name NÃO anexada" -ForegroundColor Red
        $missing += $name
    }
}

if ($missing.Count -gt 0) {
    $count = $attached.AttachedPolicies.Count
    Write-Host "`nPolíticas atualmente anexadas ($count/10):" -ForegroundColor Yellow
    $attachedNames | ForEach-Object { Write-Host "  - $_" }
    Write-Host "`nExecute como admin: .\scripts\iam-attach-datamesh-policies.ps1 -Mode $Mode" -ForegroundColor Yellow
    if ($count -ge 10 -and $Mode -eq "modular") {
        Write-Host "Dica: usuario-dados está no limite de 10 policies. Use -Mode complete" -ForegroundColor Yellow
    }
    exit 1
}

# --- Permissions boundary ---
$user = aws iam get-user --user-name $IamUser --output json | ConvertFrom-Json
if ($user.User.PermissionsBoundary) {
    Write-Host "[WARN] Permissions Boundary: $($user.User.PermissionsBoundary.PermissionsBoundaryArn)" -ForegroundColor Yellow
    Write-Host "       Admin deve incluir ações Datamesh na boundary." -ForegroundColor Yellow
}

# --- Simulação (ARNs específicos — evita falso implicitDeny com Resource *) ---
$context = "ContextKeyName=aws:RequestedRegion,ContextKeyValues=$Region,ContextKeyType=string"
$acct = $AccountId

$regionalChecks = @(
    @{ Action = "s3:ListBucket"; Resource = "arn:aws:s3:::retail-inventory-insights-dev-use1" },
    @{ Action = "s3:PutObject"; Resource = "arn:aws:s3:::retail-inventory-insights-dev-use1/origem/dt=2022-01-01/data.parquet" },
    @{ Action = "glue:GetJob"; Resource = "arn:aws:glue:${Region}:${acct}:job/retail-inventory-insights-carregar-origem-dia-dev" },
    @{ Action = "glue:CreateJob"; Resource = "arn:aws:glue:${Region}:${acct}:job/retail-inventory-insights-carregar-origem-dia-dev" },
    @{ Action = "lambda:GetFunction"; Resource = "arn:aws:lambda:${Region}:${acct}:function:retail-inventory-insights-gerar-relatorio-d1-dev" },
    @{ Action = "lambda:GetFunctionCodeSigningConfig"; Resource = "arn:aws:lambda:${Region}:${acct}:function:retail-inventory-insights-gerar-relatorio-d1-dev" },
    @{ Action = "lambda:CreateFunction"; Resource = "arn:aws:lambda:${Region}:${acct}:function:retail-inventory-insights-gerar-relatorio-d1-dev" },
    @{ Action = "states:ListStateMachineVersions"; Resource = "arn:aws:states:${Region}:${acct}:stateMachine:retail-inventory-insights-processar-dia-dev" },
    @{ Action = "states:ListTagsForResource"; Resource = "arn:aws:states:${Region}:${acct}:stateMachine:retail-inventory-insights-processar-dia-dev" },
    @{ Action = "states:DescribeStateMachine"; Resource = "arn:aws:states:${Region}:${acct}:stateMachine:retail-inventory-insights-processar-dia-dev" },
    @{ Action = "states:CreateStateMachine"; Resource = "arn:aws:states:${Region}:${acct}:stateMachine:retail-inventory-insights-processar-dia-dev" },
    @{ Action = "events:PutRule"; Resource = "arn:aws:events:${Region}:${acct}:rule/retail-inventory-insights-processar-dia-daily-dev" },
    @{ Action = "athena:CreateWorkGroup"; Resource = "arn:aws:athena:${Region}:${acct}:workgroup/retail-inventory-insights-dev" },
    @{ Action = "iam:CreateRole"; Resource = "arn:aws:iam::${acct}:role/retail-inventory-glue-dev" },
    @{ Action = "iam:PassRole"; Resource = "arn:aws:iam::${acct}:role/retail-inventory-glue-dev" },
    @{ Action = "iam:CreatePolicy"; Resource = "arn:aws:iam::${acct}:policy/retail-inventory-insights-test" },
    @{ Action = "logs:CreateLogGroup"; Resource = "arn:aws:logs:${Region}:${acct}:log-group:/aws/states/retail-inventory-insights-processar-dia-dev" },
    @{ Action = "logs:PutResourcePolicy"; Resource = "*" },
    @{ Action = "cloudwatch:PutMetricAlarm"; Resource = "arn:aws:cloudwatch:${Region}:${acct}:alarm:retail-inventory-insights-sfn-failed-dev" },
    @{ Action = "sns:CreateTopic"; Resource = "arn:aws:sns:${Region}:${acct}:retail-inventory-insights-pipeline-alerts-dev" },
    @{ Action = "cognito-idp:DescribeUserPool"; Resource = "arn:aws:cognito-idp:${Region}:${acct}:userpool/us-east-1_yJLzwZgZE" },
    @{ Action = "cognito-idp:CreateUserPool"; Resource = "*" },
    @{ Action = "ec2:DescribeAccountAttributes"; Resource = "*" },
    @{ Action = "ec2:DescribeInternetGateways"; Resource = "*" },
    @{ Action = "ecs:CreateCluster"; Resource = "*" },
    @{ Action = "ecs:RegisterTaskDefinition"; Resource = "*" },
    @{ Action = "ec2:CreateSecurityGroup"; Resource = "*" },
    @{ Action = "elasticloadbalancing:CreateLoadBalancer"; Resource = "*" },
    @{ Action = "elasticloadbalancing:CreateTargetGroup"; Resource = "*" },
    @{ Action = "apigateway:POST"; Resource = "*" }
)

$globalChecks = @(
    @{ Action = "cloudfront:CreateDistribution"; Resource = "*" },
    @{ Action = "cloudfront:CreateOriginAccessControl"; Resource = "*" }
)

function Test-Action($action, $resourceArn, [switch]$WithRegion) {
    $args = @(
        "iam", "simulate-principal-policy",
        "--policy-source-arn", $UserArn,
        "--action-names", $action,
        "--resource-arns", $resourceArn,
        "--output", "json"
    )
    if ($WithRegion) {
        $args += @("--context-entries", $context)
    }
    $result = aws @args 2>$null | ConvertFrom-Json
    return $result.EvaluationResults[0].EvalDecision
}

$fail = 0

Write-Host "`nAções regionais ($Region):" -ForegroundColor Cyan
foreach ($check in $regionalChecks) {
    $decision = Test-Action $check.Action $check.Resource -WithRegion
    if ($decision -eq "allowed") {
        Write-Host "  [OK] $($check.Action)" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] $($check.Action) -> $decision" -ForegroundColor Red
        $fail++
    }
}

Write-Host "`nAções globais:" -ForegroundColor Cyan
foreach ($check in $globalChecks) {
    $decision = Test-Action $check.Action $check.Resource
    if ($decision -eq "allowed") {
        Write-Host "  [OK] $($check.Action)" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] $($check.Action) -> $decision" -ForegroundColor Red
        $fail++
    }
}

if ($fail -gt 0) {
    Write-Host @"

$fail permissão(ões) negada(s).

Checklist admin:
  1. Rodar: .\scripts\iam-attach-datamesh-policies.ps1 -Mode $Mode
  2. Verificar Permissions Boundary em usuario-dados
  3. Verificar SCP/Deny na Organization
  4. Políticas legadas (DatameshPortalDeployDev) podem ser removidas após migração

Depois:
  cd terraform\environments\dev
  terraform apply "-var-file=dev.tfvars"

"@ -ForegroundColor Yellow
    exit 1
}

Write-Host "`nPermissões OK — terraform apply completo liberado (W1-W7)." -ForegroundColor Green
