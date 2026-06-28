# Build Lambda deployment package for all report handlers (D-1/D-2/D-3)
param(
    [string]$RepoRoot = (Split-Path $PSScriptRoot -Parent)
)

$ErrorActionPreference = "Stop"
$PkgDir = Join-Path $RepoRoot "lambda\build\lambda_reports_pkg"
$ZipPath = Join-Path $RepoRoot "lambda\build\lambda_reports.zip"
$LegacyD1Zip = Join-Path $RepoRoot "lambda\build\gerar_relatorio_d1.zip"
$SrcDir = Join-Path $RepoRoot "lambda\reports"

Write-Host "=== Build Lambda reports package (D-1/D-2/D-3) ===" -ForegroundColor Cyan

if (Test-Path $PkgDir) { Remove-Item -Recurse -Force $PkgDir }
New-Item -ItemType Directory -Force -Path $PkgDir | Out-Null

Get-ChildItem (Join-Path $SrcDir "*.py") | ForEach-Object { Copy-Item $_.FullName $PkgDir }

$pip = $null
foreach ($candidate in @(
    (Join-Path $RepoRoot ".venv\Scripts\pip.exe"),
    "pip",
    "pip3"
)) {
    if ($candidate -eq "pip" -or $candidate -eq "pip3") {
        if (Get-Command $candidate -ErrorAction SilentlyContinue) { $pip = $candidate; break }
    } elseif (Test-Path $candidate) {
        $pip = $candidate
        break
    }
}
if (-not $pip) { throw "pip not found" }

Write-Host "Installing dependencies with manylinux2014_x86_64 wheels..." -ForegroundColor Yellow
& $pip install `
    -r (Join-Path $SrcDir "requirements.txt") `
    -t $PkgDir `
    --platform manylinux2014_x86_64 `
    --python-version 3.12 `
    --only-binary=:all: `
    --upgrade `
    --no-cache-dir
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

foreach ($zip in @($ZipPath, $LegacyD1Zip)) {
    if (Test-Path $zip) { Remove-Item -Force $zip }
}
$zipDir = Split-Path $ZipPath -Parent
if (-not (Test-Path $zipDir)) { New-Item -ItemType Directory -Force -Path $zipDir | Out-Null }

Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($PkgDir, $ZipPath)
Copy-Item $ZipPath $LegacyD1Zip -Force

$sizeMb = [math]::Round((Get-Item $ZipPath).Length / 1MB, 2)
Write-Host "Package: $ZipPath ($sizeMb MB)" -ForegroundColor Green
Write-Host "Legacy alias: $LegacyD1Zip (W5 compat)" -ForegroundColor Green
