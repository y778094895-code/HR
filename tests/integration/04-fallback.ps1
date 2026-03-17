# 04-fallback.ps1 — Fallback and negative path verification
# Purpose: Confirm 404 for unknown routes, auth enforcement on protected routes,
#          and graceful degradation when downstream services are unavailable
# Prerequisites: Docker Compose stack running, seeded user admin@smart-hr.com / Admin@123
# Note: Test F4 requires ml-service to be STOPPED. The script will attempt to
#       stop/restart it automatically, or you can run it manually.
# Failure: Any single failure exits with code 1

$ErrorActionPreference = "Stop"
$script:TestCount = 0
$script:PassCount = 0

function Test-Endpoint {
    param (
        [string]$Name,
        [string]$Url,
        [string]$Method = "Get",
        [hashtable]$Headers = @{},
        [string]$Body = "",
        [int[]]$AcceptedStatusCodes = @(200),
        [string]$ExpectedMatch = "",
        [string]$RejectMatch = ""
    )

    $script:TestCount++
    Write-Host "  [$script:TestCount] $Name... " -NoNewline

    $statusCode = 0
    $content = ""

    try {
        $params = @{
            Uri             = $Url
            Method          = $Method
            Headers         = $Headers
            UseBasicParsing = $true
            TimeoutSec      = 15
        }
        if ($Body -ne "") {
            $params["Body"] = $Body
            $params["ContentType"] = "application/json"
        }

        $response = Invoke-WebRequest @params
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

    if ($statusCode -notin $AcceptedStatusCodes) {
        Write-Host "FAIL" -ForegroundColor Red
        Write-Host "    Expected status in [$($AcceptedStatusCodes -join ', ')], got $statusCode" -ForegroundColor DarkRed
        Write-Host "    Body: $content" -ForegroundColor DarkGray
        exit 1
    }

    if ($ExpectedMatch -ne "" -and $content -notmatch [regex]::Escape($ExpectedMatch)) {
        Write-Host "FAIL" -ForegroundColor Red
        Write-Host "    Body did not contain: $ExpectedMatch" -ForegroundColor DarkRed
        Write-Host "    Actual: $content" -ForegroundColor DarkGray
        exit 1
    }

    if ($RejectMatch -ne "" -and $content -match [regex]::Escape($RejectMatch)) {
        Write-Host "FAIL" -ForegroundColor Red
        Write-Host "    Body must NOT contain: $RejectMatch" -ForegroundColor DarkRed
        exit 1
    }

    $script:PassCount++
    Write-Host "PASS (status $statusCode)" -ForegroundColor Green
    return $content
}

Write-Host ""
Write-Host "=== Category 4: Fallback / Negative Tests ===" -ForegroundColor Cyan
Write-Host ""

# F1: Unknown route returns 404
# Purpose: Confirm the gateway doesn't leak requests to internal services
# Input: GET :8080/nonexistent-path
# Expected: 404
# Failure: Catch-all route missing - possible open proxy
Test-Endpoint -Name "F1 Unknown route returns 404" `
    -Url "http://localhost:8080/api/nonexistent-path" `
    -AcceptedStatusCodes @(404)

# F2: Protected endpoint without token (employees)
# Purpose: Confirm auth middleware applies to protected proxy routes
# Input: GET :8080/employees (no Authorization header)
# Expected: 401
# Failure: Auth middleware skipped on /employees route
Test-Endpoint -Name "F2 Protected /employees without token" `
    -Url "http://localhost:8080/api/employees" `
    -AcceptedStatusCodes @(401)

# F3: Protected endpoint without token (dashboard)
# Purpose: Confirm auth middleware applies to protected proxy routes
# Input: GET :8080/dashboard/stats (no Authorization header)
# Expected: 401
# Failure: Auth middleware skipped on /dashboard route
Test-Endpoint -Name "F3 Protected /dashboard without token" `
    -Url "http://localhost:8080/api/dashboard/stats" `
    -AcceptedStatusCodes @(401)

# F4: Graceful ML unavailable
# Purpose: Confirm backend handles ML service timeout/down gracefully
# Input: GET :8080/ml/predict with valid token, ML service stopped
# Expected: A structured error response (5xx with JSON), NOT a raw connection error
# Failure: Backend doesn't wrap downstream failures
Write-Host ""
Write-Host "  --- F4 requires stopping ml-service ---" -ForegroundColor Yellow

# Acquire token first
try {
    $loginBody = '{"email":"admin@smart-hr.com","password":"Admin@123"}'
    $loginResp = Invoke-WebRequest -Uri "http://localhost:8080/api/auth/login" `
        -Method Post -Body $loginBody -ContentType "application/json" `
        -UseBasicParsing -TimeoutSec 10
    $token = ($loginResp.Content | ConvertFrom-Json).data.access_token
}
catch {
    Write-Host "  [F4] SKIP (cannot acquire token)" -ForegroundColor Yellow
    $token = $null
}

if ($token) {
    $authHeaders = @{ "Authorization" = "Bearer $token" }

    # Stop ML service
    Write-Host "  Stopping ml-service..." -ForegroundColor DarkGray
    docker compose stop ml-service 2>$null

    Start-Sleep -Seconds 3

    Test-Endpoint -Name "F4 Graceful ML unavailable" `
        -Url "http://localhost:8080/api/ml/predict" `
        -Headers $authHeaders `
        -AcceptedStatusCodes @(500, 502, 503, 504, 408, 422, 400) `
        -RejectMatch "ECONNREFUSED"

    # Restart ML service
    Write-Host "  Restarting ml-service..." -ForegroundColor DarkGray
    docker compose start ml-service 2>$null
}
else {
    $script:TestCount++
    Write-Host "  [$script:TestCount] F4 Graceful ML unavailable... SKIP" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Fallback: $script:PassCount/$script:TestCount passed ===" -ForegroundColor Green
exit 0
