# run-all.ps1 - Sequential integration test runner
# Runs all 4 test categories in order and reports aggregate results.
# Usage: .\tests\integration\run-all.ps1
# Prerequisites: Docker Compose stack running with all services up.

$ErrorActionPreference = "Continue"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

$scriptNames = @("01-health.ps1", "02-auth.ps1", "03-service-chain.ps1", "04-fallback.ps1")
$categoryNames = @("Health", "Auth Flow", "Service Chain", "Fallback")

$totalPassed = 0
$totalFailed = 0

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  Smart HR - Integration Verification Suite" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
$now = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Write-Host "  Time: $now"
Write-Host ""

for ($i = 0; $i -lt $scriptNames.Count; $i++) {
    $scriptPath = Join-Path $ScriptDir $scriptNames[$i]
    $catName = $categoryNames[$i]

    if (-not (Test-Path $scriptPath)) {
        Write-Host "  SKIP $catName - $($scriptNames[$i]) not found" -ForegroundColor Yellow
        continue
    }

    & $scriptPath

    if ($LASTEXITCODE -eq 0) {
        $totalPassed++
    }
    else {
        $totalFailed++
        Write-Host ""
        Write-Host "  !!! $catName FAILED - stopping here !!!" -ForegroundColor Red
        Write-Host ""
        break
    }
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan

if ($totalFailed -eq 0) {
    Write-Host "  Summary: $totalPassed category(s) passed, $totalFailed failed" -ForegroundColor Green
}
else {
    Write-Host "  Summary: $totalPassed category(s) passed, $totalFailed failed" -ForegroundColor Red
}

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

if ($totalFailed -gt 0) {
    exit 1
}
exit 0
