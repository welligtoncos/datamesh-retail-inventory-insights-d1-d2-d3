# W7-US12 Deploy · E8-US12 FastAPI BFF para ECS/ECR
# Uso (repo root): .\scripts\w7-us12-deploy.ps1
# Requer: Docker, AWS CLI, Terraform, credenciais com ECR push + terraform apply

param(
    [string]$Region = "us-east-1",
    [string]$ImageTag = "latest"
)

$ErrorActionPreference = "Stop"
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$ApiDir = Join-Path $RepoRoot "portal-api"
$TfDir = Join-Path $RepoRoot "terraform\environments\dev"

Write-Host "=== W7 E8-US12 Portal API Deploy ===" -ForegroundColor Cyan

$account = (aws sts get-caller-identity --query Account --output text)
if (-not $account) { throw "AWS credentials unavailable" }

$ecrRepo = "rii-portal-dev-api"
$imageUri = "${account}.dkr.ecr.${Region}.amazonaws.com/${ecrRepo}:${ImageTag}"

Write-Host "`n[1] Docker build..." -ForegroundColor Yellow
docker build -t "${ecrRepo}:${ImageTag}" $ApiDir
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "`n[2] ECR login + push..." -ForegroundColor Yellow
aws ecr describe-repositories --repository-names $ecrRepo --region $Region 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ECR repo nao encontrado — rode terraform apply primeiro (module portal ecr.tf)." -ForegroundColor Yellow
}
aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin "${account}.dkr.ecr.${Region}.amazonaws.com"
docker tag "${ecrRepo}:${ImageTag}" $imageUri
docker push $imageUri
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "`n[3] Terraform apply (portal_api_image)..." -ForegroundColor Yellow
Push-Location $TfDir
terraform init -input=false
terraform apply -auto-approve "-var-file=dev.tfvars" "-var=portal_api_image=$imageUri"
$exit = $LASTEXITCODE
Pop-Location
if ($exit -ne 0) { exit $exit }

Write-Host "`nDeploy concluido: $imageUri" -ForegroundColor Green
Write-Host "Proximo: .\scripts\w7-us12-validate.ps1 e checklist E2E no CloudFront." -ForegroundColor Cyan
