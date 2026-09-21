$ErrorActionPreference = 'Stop'
$port = 8080
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

$py = Get-Command python -ErrorAction SilentlyContinue
if (-not $py) {
    Write-Error 'Python was not found in PATH. Install Python and try again.'
    exit 1
}

$existing = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
if ($existing) {
    foreach ($conn in $existing) {
        try {
            Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
        } catch {
            # Ignore already-stopped processes
        }
    }
}

$server = Start-Process -FilePath $py.Source -ArgumentList '-m', 'http.server', $port -WorkingDirectory $root -WindowStyle Hidden -PassThru
Start-Sleep -Seconds 2
Start-Process "http://localhost:$port/?v=20260921-5"

Write-Host "Game server started on http://localhost:$port/"
Write-Host "PID: $($server.Id)"
