# Simple Health Check Script
Write-Host "Testing Smart HR Services..." -ForegroundColor Cyan
Write-Host ""

# Test Backend
Write-Host "Backend API: " -NoNewline
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/health" -TimeoutSec 5
    Write-Host "✓ HEALTHY" -ForegroundColor Green
    Write-Host "  Response: $($response | ConvertTo-Json -Compress)"
}
catch {
    Write-Host "✗ FAILED" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)"
}
Write-Host ""

# Test ML Service
Write-Host "ML Service: " -NoNewline
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/health" -TimeoutSec 5
    Write-Host "✓ HEALTHY" -ForegroundColor Green
    Write-Host "  Response: $($response | ConvertTo-Json -Compress)"
}
catch {
    Write-Host "✗ FAILED" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)"
}
Write-Host ""

# Test Frontend
Write-Host "Frontend: " -NoNewline
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ HEALTHY" -ForegroundColor Green
    }
}
catch {
    Write-Host "✗ FAILED" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)"
}
Write-Host ""

# Test Authentication
Write-Host "Authentication: " -NoNewline
try {
    $body = @{
        email    = "admin@smart-hr.com"
        password = "Admin@123"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body `
        -TimeoutSec 10

    if ($response.access_token) {
        Write-Host "✓ WORKING" -ForegroundColor Green
        Write-Host "  Token received: $($response.access_token.Substring(0, 20))..."
    }
    else {
        Write-Host "⚠ NO TOKEN" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "✗ FAILED" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)"
}
Write-Host ""

Write-Host "Test complete!" -ForegroundColor Cyan
