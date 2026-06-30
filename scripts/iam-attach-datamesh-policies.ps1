# Anexa políticas gerenciadas do Datamesh (W1-W7) ao usuário IAM.
#
# Uso (repo root):
#   .\scripts\iam-attach-datamesh-policies.ps1                    # modo complete (recomendado)
#   .\scripts\iam-attach-datamesh-policies.ps1 -Mode modular      # 4 políticas (precisa <10 no usuário)
#   .\scripts\iam-attach-datamesh-policies.ps1 -Mode unified      # 1 política ampla
#
# Modo complete: remove políticas legadas Datamesh*, anexa 2 políticas consolidadas.

param(
    [string]$IamUser = "usuario-dados",
    [ValidateSet("complete", "modular", "unified")]
    [string]$Mode = "complete",
    [switch]$SkipLegacyCleanup
)

$ErrorActionPreference = "Stop"
$IamDir = Join-Path $PSScriptRoot "..\terraform\iam" | Resolve-Path
$AccountId = (aws sts get-caller-identity --query Account --output text)

$LegacyManagedToDetach = @(
    "DatameshLambdaTerraformDev",
    "DatameshPortalDeployDev",
    "Datamesh01StorageGlueAthenaDev",
    "Datamesh02LambdaSfnEventsDev",
    "Datamesh03IamLogsMonitoringDev",
    "Datamesh04PortalEdgeDev",
    "DatameshTerraformOperatorDev"
)

$LegacyInlineToDelete = @(
    "DatameshPortalDeployAddon",
    "DatameshPortalDeployDev"
)

$ModularPolicies = @(
    @{ Name = "Datamesh01StorageGlueAthenaDev"; File = "policies\01-datamesh-storage-glue-athena.json"; Description = "Datamesh dev: S3, Glue, Athena" },
    @{ Name = "Datamesh02LambdaSfnEventsDev"; File = "policies\02-datamesh-lambda-sfn-events.json"; Description = "Datamesh dev: Lambda, SFN, EventBridge" },
    @{ Name = "Datamesh03IamLogsMonitoringDev"; File = "policies\03-datamesh-iam-logs-monitoring.json"; Description = "Datamesh dev: IAM, CloudWatch, SNS" },
    @{ Name = "Datamesh04PortalEdgeDev"; File = "policies\04-datamesh-portal-edge.json"; Description = "Datamesh dev: Portal W7" }
)

$CompletePolicies = @(
    @{ Name = "DatameshTerraformCompleteA"; File = "datamesh-terraform-complete-a.json"; Description = "Datamesh dev: S3, Glue, Athena, Lambda, SFN, Events" },
    @{ Name = "DatameshTerraformCompleteB"; File = "datamesh-terraform-complete-b.json"; Description = "Datamesh dev: IAM, Logs, Portal, CloudFront" }
)

$UnifiedPolicy = @{
    Name = "DatameshTerraformOperatorDev"
    File = "datamesh-terraform-operator-dev.json"
    Description = "Datamesh dev: política única ampla us-east-1"
}

function Remove-LegacyPolicies {
    Write-Host "`n--- Limpeza políticas legadas ---" -ForegroundColor Cyan

    foreach ($inline in $LegacyInlineToDelete) {
        $exists = aws iam list-user-policies --user-name $IamUser --output json | ConvertFrom-Json
        if ($exists.PolicyNames -contains $inline) {
            Write-Host "Removendo inline: $inline" -ForegroundColor Yellow
            aws iam delete-user-policy --user-name $IamUser --policy-name $inline | Out-Null
        }
    }

    $attached = aws iam list-attached-user-policies --user-name $IamUser --output json | ConvertFrom-Json
    foreach ($legacyName in $LegacyManagedToDetach) {
        $arn = "arn:aws:iam::${AccountId}:policy/$legacyName"
        if ($attached.AttachedPolicies.PolicyArn -contains $arn) {
            Write-Host "Desanexando: $legacyName" -ForegroundColor Yellow
            aws iam detach-user-policy --user-name $IamUser --policy-arn $arn | Out-Null
        }
    }
}

function Ensure-PolicyAttached {
    param(
        [string]$PolicyName,
        [string]$PolicyFilePath,
        [string]$Description
    )

    $PolicyArn = "arn:aws:iam::${AccountId}:policy/$PolicyName"
    Write-Host "`n--- $PolicyName ---" -ForegroundColor Cyan

    $existing = aws iam get-policy --policy-arn $PolicyArn 2>$null
    if (-not $existing) {
        Write-Host "Criando política..." -ForegroundColor Yellow
        $created = aws iam create-policy `
            --policy-name $PolicyName `
            --policy-document "file://$PolicyFilePath" `
            --description $Description | ConvertFrom-Json
        $PolicyArn = $created.Policy.Arn
        Write-Host "  Criada: $PolicyArn" -ForegroundColor Green
    } else {
        Write-Host "Atualizando versão default..." -ForegroundColor Yellow
        aws iam create-policy-version `
            --policy-arn $PolicyArn `
            --policy-document "file://$PolicyFilePath" `
            --set-as-default | Out-Null
        Write-Host "  Versão atualizada." -ForegroundColor Green
    }

    $attached = aws iam list-attached-user-policies --user-name $IamUser --output json | ConvertFrom-Json
    if ($attached.AttachedPolicies.PolicyArn -contains $PolicyArn) {
        Write-Host "  Já anexada a $IamUser." -ForegroundColor Green
    } else {
        $count = $attached.AttachedPolicies.Count
        if ($count -ge 10) {
            throw "Limite de 10 políticas gerenciadas atingido em $IamUser ($count/10). Rode com -SkipLegacyCleanup:`$false ou desanexe políticas AWS redundantes manualmente."
        }
        aws iam attach-user-policy --user-name $IamUser --policy-arn $PolicyArn
        Write-Host "  Anexada a $IamUser." -ForegroundColor Green
    }

    return $PolicyArn
}

Write-Host "=== IAM: políticas completas Datamesh ===" -ForegroundColor Cyan
Write-Host "Conta: $AccountId | Usuário: $IamUser | Modo: $Mode"

if (-not $SkipLegacyCleanup -and ($Mode -eq "complete" -or $Mode -eq "unified")) {
    Remove-LegacyPolicies
}

$policyArns = @()
$policySet = switch ($Mode) {
    "modular" { $ModularPolicies }
    "complete" { $CompletePolicies }
    "unified" { @($UnifiedPolicy) }
}

foreach ($p in $policySet) {
    $path = Join-Path $IamDir $p.File
    if (-not (Test-Path $path)) { throw "Arquivo não encontrado: $path" }
    $arn = Ensure-PolicyAttached -PolicyName $p.Name -PolicyFilePath $path -Description $p.Description
    $policyArns += $arn
}

Write-Host "`nPolíticas configuradas:" -ForegroundColor Green
$policyArns | ForEach-Object { Write-Host "  $_" }

$attachedFinal = aws iam list-attached-user-policies --user-name $IamUser --output json | ConvertFrom-Json
Write-Host "`nTotal anexadas em ${IamUser}: $($attachedFinal.AttachedPolicies.Count)/10" -ForegroundColor Cyan

Write-Host "`nExecutando verificação..." -ForegroundColor Yellow
& (Join-Path $PSScriptRoot "iam-verify-datamesh-policies.ps1") -IamUser $IamUser -Mode $Mode
