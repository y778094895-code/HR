# gateway service is exposed on port 8080 (see docker-compose.yml)
$GatewayUrl = "http://localhost:8080/api"

Write-Host "Testing Gateway Prefixes..." -ForegroundColor Cyan

$Prefixes = @("dashboard", "users", "turnover", "performance", "training", "reports", "impact", "recommendations", "employees", "fairness", "interventions")

$AllPassed = $true

foreach ($prefix in $Prefixes) {
    try {
        $response = Invoke-WebRequest -Uri "$GatewayUrl/$prefix" -Method Get -ErrorAction Ignore
        $StatusCode = $response.StatusCode
        if ($null -eq $StatusCode) { $StatusCode = 0 }
    } catch {
        if ($_.Exception.Response) {
            $StatusCode = $_.Exception.Response.StatusCode.value__
        } else {
            $StatusCode = 0
            Write-Host "Could not connect to gateway. Is it running?" -ForegroundColor Yellow
        }
    }

    if ($StatusCode -eq 404 -or $StatusCode -eq 0) {
        Write-Host ("❌ {0}: FAILED (Returned 404 Not Found or Connection Failed)" -f $prefix) -ForegroundColor Red
        $AllPassed = $false
    } else {
        # 401 Unauthorized is expected and means the Gateway successfully routed it to the backend's auth middleware!
        Write-Host ("✅ {0}: SUCCESS (Returned {1})" -f $prefix, $StatusCode) -ForegroundColor Green
    }
}

Write-Host "Testing /api/version..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$GatewayUrl/version" -Method Get -ErrorAction Ignore
    $StatusCode = $response.StatusCode
} catch {
    if ($_.Exception.Response) {
        $StatusCode = $_.Exception.Response.StatusCode.value__
    } else {
        $StatusCode = 0
    }
}

if ($StatusCode -eq 200) {
    Write-Host ("✅ version: SUCCESS (Returned 200)") -ForegroundColor Green
} else {
    Write-Host ("❌ version: FAILED (Returned {0})" -f $StatusCode) -ForegroundColor Red
    $AllPassed = $false
}

Write-Host "-----------------------------------"
if ($AllPassed) {
    Write-Host "✅ All smoke tests passed (No 404s)!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ Some smoke tests failed (Returned 404)." -ForegroundColor Red
    exit 1
}
