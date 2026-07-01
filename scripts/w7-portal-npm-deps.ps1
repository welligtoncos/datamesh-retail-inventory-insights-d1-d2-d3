# Helper: instala deps do portal-web sem falhar se esbuild estiver bloqueado (ng serve).
# Dot-source: . (Join-Path $PSScriptRoot "w7-portal-npm-deps.ps1")

function Install-PortalWebDeps {
    param(
        [switch]$ForceCi
    )

    $angularCore = Join-Path "node_modules" "@angular/core/package.json"
    $hasDeps = Test-Path $angularCore

    if (-not $ForceCi -and $hasDeps) {
        Write-Host "node_modules presente — pulando npm ci." -ForegroundColor DarkYellow
        Write-Host "  (Use -ForceCi no script de validate para forcar reinstalacao.)" -ForegroundColor DarkGray
        return $true
    }

    Write-Host "npm ci..." -ForegroundColor Yellow
    npm ci
    if ($LASTEXITCODE -eq 0) {
        return $true
    }

    if (Test-Path $angularCore) {
        Write-Host ""
        Write-Host "AVISO: npm ci falhou (EPERM — esbuild/node em uso)." -ForegroundColor Yellow
        Write-Host "  Feche 'npm start', terminais no portal-web e o Cursor se necessario." -ForegroundColor Yellow
        Write-Host "  Continuando com node_modules existente para build/test." -ForegroundColor Yellow
        Write-Host ""
        return $true
    }

    Write-Host "npm ci falhou; tentando limpar node_modules..." -ForegroundColor Yellow
    if (Test-Path node_modules) {
        Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
    npm ci
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERRO: nao foi possivel instalar dependencias. Pare processos que usam portal-web/node_modules." -ForegroundColor Red
        return $false
    }
    return $true
}
