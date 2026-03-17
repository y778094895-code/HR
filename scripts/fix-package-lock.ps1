# Fix Package Lock Script
# This script updates package-lock.json to sync with package.json

Write-Host "Fixing package-lock.json sync issue..." -ForegroundColor Cyan
Write-Host ""

# Navigate to server directory
Set-Location server

Write-Host "Step 1: Removing old package-lock.json..." -ForegroundColor Yellow
if (Test-Path "package-lock.json") {
    Remove-Item "package-lock.json" -Force
    Write-Host "✓ Removed old package-lock.json" -ForegroundColor Green
}
else {
    Write-Host "⚠ No package-lock.json found" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "Step 2: Running npm install to regenerate lock file..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ package-lock.json regenerated successfully" -ForegroundColor Green
}
else {
    Write-Host "✗ npm install failed" -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "Step 3: Verifying lock file..." -ForegroundColor Yellow
if (Test-Path "package-lock.json") {
    Write-Host "✓ package-lock.json exists" -ForegroundColor Green
    $lockFileSize = (Get-Item "package-lock.json").Length
    Write-Host "  Size: $lockFileSize bytes" -ForegroundColor Gray
}
else {
    Write-Host "✗ package-lock.json not created" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Return to root directory
Set-Location ..

Write-Host "✅ Fix complete! You can now run: docker-compose build" -ForegroundColor Green
Write-Host ""
