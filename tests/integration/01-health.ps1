# 01-health.ps1 — Health endpoint verification
# Purpose: Confirm all services are alive and gateway proxies route correctly
# Prerequisites: Docker Compose stack running, Gateway on :8080, Backend on :3000
# Failure: Any single failure exits with code 1

$ErrorActionPreference = "Stop"
$script:TestCount = 0
$script:PassCount = 0

function Test-Endpoint {
    param (
        [string]$Name,
        [string]$Url,
        [int]$ExpectedStatusCode = 200,
        [string]$ExpectedMatch = ""
    )

    $script:TestCount++
    Write-Host "  [$script:TestCount] $Name... " -NoNewline

    try {
        $response = Invoke-WebRequest -Uri $Url -Method Get -UseBasicParsing -TimeoutSec 10
        $statusCode = [int]$response.StatusCode
        $content = $response.Content
    }
    catch {
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $content = $reader.ReadToEnd()
        }
        else {
            Write-Host "FAIL (connection refused)" -ForegroundColor Red
            Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor DarkRed
            exit 1
        }
    }

    if ($statusCode -ne $ExpectedStatusCode) {
        Write-Host "FAIL" -ForegroundColor Red
        Write-Host "    Expected status $ExpectedStatusCode, got $statusCode" -ForegroundColor DarkRed
        Write-Host "    Body: $content" -ForegroundColor DarkGray
        exit 1
    }

    if ($ExpectedMatch -ne "" -and $content -notmatch [regex]::Escape($ExpectedMatch)) {
        Write-Host "FAIL" -ForegroundColor Red
        Write-Host "    Body did not contain: $ExpectedMatch" -ForegroundColor DarkRed
        Write-Host "    Actual: $content" -ForegroundColor DarkGray
        exit 1
    }

    $script:PassCount++
    Write-Host "PASS" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Category 1: Health Tests ===" -ForegroundColor Cyan
Write-Host ""

# H1: Gateway self-health
# Purpose: Verify gateway process is alive
# Input: GET :8080/health
# Expected: 200, body contains "status"
# Failure: Gateway not running or crashed
Test-Endpoint -Name "H1 Gateway self-health" -Url "http://localhost:8080/health" -ExpectedMatch "ok"

# H2: Backend proxy health
# Purpose: Verify gateway -> backend proxy route is functional
# Input: GET :8080/api/employees/health
# Expected: 200, body contains "employee-service"
# Failure: Backend down or proxy misconfigured
Test-Endpoint -Name "H2 Backend proxy health" -Url "http://localhost:8080/api/employees/health" -ExpectedMatch "employee-service"

# H3: ML Service proxy health
# Purpose: Verify gateway -> ML service proxy route
# Input: GET :8080/api/ml/health
# Expected: 200, body contains "ml-service"
# Failure: ML service down or proxy misconfigured
Test-Endpoint -Name "H3 ML Service proxy health" -Url "http://localhost:8080/api/ml/health" -ExpectedMatch "ml-service"

# H4: HR AI Layer proxy health
# Purpose: Verify gateway -> HR AI layer proxy route
# Input: GET :8080/api/hr/health
# Expected: 200, body contains "model_path"
# Failure: HR AI layer down or proxy misconfigured
Test-Endpoint -Name "H4 HR AI Layer proxy health" -Url "http://localhost:8080/api/hr/health" -ExpectedMatch "model_path"

# H5: Backend direct health (bypasses gateway)
# Purpose: Verify backend responds independently of gateway
# Input: GET :3000/api/health
# Expected: 200, body contains "employee-service"
# Failure: Backend container itself is unhealthy
Test-Endpoint -Name "H5 Backend direct health" -Url "http://localhost:3000/api/health" -ExpectedMatch "employee-service"

Write-Host ""
Write-Host "=== Health: $script:PassCount/$script:TestCount passed ===" -ForegroundColor Green
exit 0
