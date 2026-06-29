# Atalho: reprocessar um dia (delega para reprocessar-dia-dev.ps1)
#   .\scripts\processar-dia-completo.ps1 -DiaDado "2022-01-03" -SomenteD1

param(
    [Parameter(Mandatory = $true)]
    [Alias("Dt")]
    [string]$DiaDado,
    [switch]$SomenteD1,
    [int]$JanelaD3 = 7,
    [string]$Region = "us-east-1",
    [string]$Bucket = "retail-inventory-insights-dev-use1"
)

$ErrorActionPreference = "Stop"
$args = @("-DiaDado", $DiaDado, "-JanelaD3", $JanelaD3, "-Region", $Region, "-Bucket", $Bucket)
if ($SomenteD1) { $args += "-SomenteD1" }
& (Join-Path $PSScriptRoot "reprocessar-dia-dev.ps1") @args
exit $LASTEXITCODE
