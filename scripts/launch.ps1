param([switch]$Smoke)
$ErrorActionPreference = 'Stop'
$sourceRoot = Split-Path -Parent $PSScriptRoot
$html = Join-Path $sourceRoot 'web/index.html'
if (-not (Test-Path -LiteralPath $html)) { throw 'Please extract the complete package before launching.' }
$pythonCmd = Get-Command python.exe -ErrorAction SilentlyContinue
if ($pythonCmd -and $pythonCmd.Source -like '*WindowsApps*') { $pythonCmd = $null }
if (-not $pythonCmd) { $pythonCmd = Get-Command py.exe -ErrorAction SilentlyContinue }
if ($pythonCmd) {
    $serverFile = Join-Path $PSScriptRoot 'server.py'
    if ($Smoke) {
        & $pythonCmd.Source $serverFile --smoke
        if ($LASTEXITCODE -ne 0) { throw 'Local HTML server failed its startup check.' }
    } else {
        $launchArgs = @(('"{0}"' -f $serverFile), '--open')
        Start-Process -FilePath $pythonCmd.Source -ArgumentList $launchArgs -WorkingDirectory $sourceRoot -WindowStyle Hidden | Out-Null
    }
} else {
    if ($Smoke) { Write-Output 'Static HTML exists; Python unavailable, direct offline launch selected.' }
    else { Start-Process -FilePath $html | Out-Null }
}
