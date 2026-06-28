# Build Lambda deployment package (Linux x86_64 wheels for AWS Lambda Python 3.12)
param(
    [string]$RepoRoot = (Split-Path $PSScriptRoot -Parent)
)

$ErrorActionPreference = "Stop"
$PkgDir = Join-Path $RepoRoot "lambda\build\gerar_relatorio_d1_pkg"
$ZipPath = Join-Path $RepoRoot "lambda\build\gerar_relatorio_d1.zip"
$SrcDir = Join-Path $RepoRoot "lambda\reports"

Write-Host "=== Build Lambda D-1 package ===" -ForegroundColor Cyan

if (Test-Path $PkgDir) { Remove-Item -Recurse -Force $PkgDir }
New-Item -ItemType Directory -Force -Path $PkgDir | Out-Null

Copy-Item (Join-Path $SrcDir "gerar_relatorio_d1.py") $PkgDir
Copy-Item (Join-Path $SrcDir "excel_helpers.py") $PkgDir

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

if (Test-Path $ZipPath) { Remove-Item -Force $ZipPath }
$zipDir = Split-Path $ZipPath -Parent
if (-not (Test-Path $zipDir)) { New-Item -ItemType Directory -Force -Path $zipDir | Out-Null }

Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($PkgDir, $ZipPath)

$sizeMb = [math]::Round((Get-Item $ZipPath).Length / 1MB, 2)
Write-Host "Package: $ZipPath ($sizeMb MB)" -ForegroundColor Green
