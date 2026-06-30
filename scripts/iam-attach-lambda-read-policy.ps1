# DEPRECATED — incluído em iam-attach-datamesh-policies.ps1 (política 02).
# Uso preferido: .\scripts\iam-attach-datamesh-policies.ps1

param(
    [string]$IamUser = "usuario-dados"
)

Write-Host "[DEPRECATED] Use: .\scripts\iam-attach-datamesh-policies.ps1" -ForegroundColor Yellow
& (Join-Path $PSScriptRoot "iam-attach-datamesh-policies.ps1") -IamUser $IamUser -Mode complete
exit $LASTEXITCODE
