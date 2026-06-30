# DEPRECATED — redireciona para iam-verify-datamesh-policies.ps1 (W1-W7 completo).
# Uso: .\scripts\iam-verify-portal-permissions.ps1

param(
    [string]$IamUser = "usuario-dados",
    [string]$Region = "us-east-1"
)

Write-Host "[DEPRECATED] Use: .\scripts\iam-verify-datamesh-policies.ps1" -ForegroundColor Yellow
& (Join-Path $PSScriptRoot "iam-verify-datamesh-policies.ps1") -IamUser $IamUser -Region $Region
exit $LASTEXITCODE
