# Lista particoes processadas vs faltantes no S3 (origem ou enriquecido)
# Run: .\scripts\list-partitions.ps1 -DiaInicio 2022-01-01 -DiaFim 2022-01-31

param(
    [string]$DiaInicio = "2022-01-01",
    [string]$DiaFim = "2022-01-31",
    [ValidateSet("origem", "enriquecido")]
    [string]$Layer = "enriquecido",
    [string]$Region = "us-east-1",
    [string]$Bucket = "retail-inventory-insights-dev-use1"
)

$ErrorActionPreference = "Stop"

$listing = aws s3 ls "s3://$Bucket/$Layer/" --region $Region 2>$null
$processados = @()
if ($listing) {
    foreach ($line in ($listing -split "`n")) {
        if ($line -match 'dt=(\d{4}-\d{2}-\d{2})') {
            $processados += $Matches[1]
        }
    }
}
$processados = $processados | Sort-Object -Unique

$esperados = @()
$d = [datetime]$DiaInicio
$last = [datetime]$DiaFim
while ($d -le $last) {
    $esperados += $d.ToString("yyyy-MM-dd")
    $d = $d.AddDays(1)
}

$faltantes = $esperados | Where-Object { $_ -notin $processados }
$noIntervalo = $processados | Where-Object { $_ -ge $DiaInicio -and $_ -le $DiaFim }

Write-Host "=== $Layer ($DiaInicio .. $DiaFim) ===" -ForegroundColor Cyan
Write-Host "Processados no intervalo ($($noIntervalo.Count)):" -ForegroundColor Green
$noIntervalo | ForEach-Object { Write-Host "  $_" }

Write-Host "`nFaltantes ($($faltantes.Count)):" -ForegroundColor Yellow
if ($faltantes.Count -eq 0) {
    Write-Host "  (nenhum)" -ForegroundColor Green
} else {
    $faltantes | ForEach-Object { Write-Host "  $_" }
}

Write-Host "`nTotal $Layer no bucket: $($processados.Count) particoes" -ForegroundColor Cyan
