# DEPRECATED — use iam-attach-datamesh-policies.ps1 (pacote completo W1-W7).
#
# Anexa política GERENCIADA legada DatameshPortalDeployDev.
#
# Uso preferido:
#   .\scripts\iam-attach-datamesh-policies.ps1
#
# Uso legado:
#   .\scripts\iam-attach-portal-deploy-policy.ps1 -IamUser usuario-dados

param(
    [string]$IamUser = "usuario-dados",
    [string]$PolicyName = "DatameshPortalDeployDev",
    [string]$Region = "us-east-1"
)

$ErrorActionPreference = "Stop"
$PolicyFile = Join-Path $PSScriptRoot "..\terraform\iam\portal-deploy-dev-policy.json" | Resolve-Path
$AccountId = (aws sts get-caller-identity --query Account --output text)
$PolicyArn = "arn:aws:iam::${AccountId}:policy/$PolicyName"

Write-Host "=== IAM: política gerenciada portal deploy ===" -ForegroundColor Cyan
Write-Host "User: $IamUser"
Write-Host "Policy: $PolicyArn"

$existing = aws iam get-policy --policy-arn $PolicyArn 2>$null
if (-not $existing) {
    Write-Host "Criando política gerenciada..." -ForegroundColor Yellow
    $created = aws iam create-policy `
        --policy-name $PolicyName `
        --policy-document "file://$PolicyFile" `
        --description "Terraform dev: datamesh W1-W6 + portal W7 (us-east-1)" | ConvertFrom-Json
    $PolicyArn = $created.Policy.Arn
    Write-Host "  Criada: $PolicyArn" -ForegroundColor Green
} else {
    Write-Host "Política já existe — criando nova versão..." -ForegroundColor Yellow
    aws iam create-policy-version `
        --policy-arn $PolicyArn `
        --policy-document "file://$PolicyFile" `
        --set-as-default | Out-Null
}

Write-Host "Anexando ao usuário $IamUser..." -ForegroundColor Yellow
$already = aws iam list-attached-user-policies --user-name $IamUser --output json | ConvertFrom-Json
if ($already.AttachedPolicies.PolicyArn -contains $PolicyArn) {
    Write-Host "  Já anexada." -ForegroundColor Green
} else {
    aws iam attach-user-policy --user-name $IamUser --policy-arn $PolicyArn
    Write-Host "  Anexada." -ForegroundColor Green
}

Write-Host "`n[WARN] Script legado. Migre para: .\scripts\iam-attach-datamesh-policies.ps1" -ForegroundColor Yellow
Write-Host "Verificando permissões..." -ForegroundColor Yellow
& (Join-Path $PSScriptRoot "iam-verify-datamesh-policies.ps1") -IamUser $IamUser
