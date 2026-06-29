# Simulacao multi-dia (avancado) — chama reprocessar-dia-dev.ps1 por dt
# Preferir: .\scripts\reprocessar-dia-dev.ps1 -DiaDado "YYYY-MM-DD"
# Run: .\scripts\simular-esteira-dev.ps1 -DiaInicio "2022-01-01" -DiaFim "2022-01-07"

param(
    [string]$DiaInicio = "2022-01-01",
    [string]$DiaFim = "2022-01-07",
    [int]$JanelaD3 = 7,
    [string]$Region = "us-east-1",
    [string]$Bucket = "retail-inventory-insights-dev-use1",
    [switch]$SomenteD1
)

$ErrorActionPreference = "Stop"
$Reproc = Join-Path $PSScriptRoot "reprocessar-dia-dev.ps1"

$d = [datetime]$DiaInicio
$last = [datetime]$DiaFim
$allOk = $true

Write-Host "=== Simular multi-dia (avancado) ===" -ForegroundColor Cyan
Write-Host "  $DiaInicio .. $DiaFim" -ForegroundColor Cyan

while ($d -le $last) {
    $dt = $d.ToString("yyyy-MM-dd")
    Write-Host "`n--- $dt ---" -ForegroundColor Cyan
    $args = @("-DiaDado", $dt, "-JanelaD3", $JanelaD3, "-Region", $Region, "-Bucket", $Bucket)
    if ($SomenteD1) { $args += "-SomenteD1" }
    & $Reproc @args
    if ($LASTEXITCODE -ne 0) { $allOk = $false }
    $d = $d.AddDays(1)
}

if (-not $allOk) {
    Write-Host "`n=== SIMULACAO: ALGUNS DIAS FALHARAM ===" -ForegroundColor Red
    exit 1
}
Write-Host "`n=== SIMULACAO OK ===" -ForegroundColor Green
