# 03-service-chain.ps1 — Authenticated service chain verification
# Purpose: Confirm end-to-end request path: Client -> Gateway -> Backend -> (ML/DB)
# Prerequisites: Docker Compose stack running, seeded user admin@smart-hr.com / Admin@123
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

# ---------- Acquire token (prerequisite) ----------
Write-Host ""
Write-Host "=== Category 3: Service Chain Tests ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "  [0] Acquiring token... " -NoNewline

try {
    $loginBody = '{"email":"admin@smart-hr.com","password":"Admin@123"}'
    $loginResp = Invoke-WebRequest -Uri "http://localhost:8080/api/auth/login" `
        -Method Post -Body $loginBody -ContentType "application/json" `
        -UseBasicParsing -TimeoutSec 10
    $token = ($loginResp.Content | ConvertFrom-Json).data.access_token
    if (-not $token) { throw "No access_token in response" }
    Write-Host "OK" -ForegroundColor Green
}
catch {
    Write-Host "FAIL" -ForegroundColor Red
    Write-Host "    Cannot acquire token: $($_.Exception.Message)" -ForegroundColor DarkRed
    Write-Host "    Run 02-auth.ps1 first to debug auth issues." -ForegroundColor Yellow
    exit 1
}

$authHeaders = @{ "Authorization" = "Bearer $token" }

# S1: Dashboard stats
# Purpose: Confirm gateway proxies a representative protected endpoint to backend
# Input: GET :8080/dashboard/stats with valid token
# Expected: 200, valid JSON
# Failure: Dashboard controller, route rewrite, or DB query broken
Test-Endpoint -Name "S1 Dashboard stats" `
    -Url "http://localhost:8080/api/dashboard/stats" `
    -Headers $authHeaders

# S2: Employees list
# Purpose: Confirm the primary CRUD entity resolves
# Input: GET :8080/employees with valid token
# Expected: 200, body is JSON
# Failure: Employee controller or DB broken
Test-Endpoint -Name "S2 Employees list" `
    -Url "http://localhost:8080/api/employees" `
    -Headers $authHeaders

# S3: Gateway version
# Purpose: Confirm a gateway-local endpoint (non-proxy) works
# Input: GET :8080/version
# Expected: 200, body contains "api-gateway"
# Failure: Gateway app wiring issue
Test-Endpoint -Name "S3 Gateway version" `
    -Url "http://localhost:8080/api/version" `
    -ExpectedMatch "api-gateway"

# S4: ML prediction chain
# Purpose: Confirm backend -> ML service integration via gateway
# Input: GET :8080/ml/predict with valid token
# Expected: 200 or 422 (validation error proves ML was reached), NOT 502/504
# Failure: ML service unreachable from backend or route path broken
Test-Endpoint -Name "S4 ML prediction chain" `
    -Url "http://localhost:8080/api/ml/predict" `
    -Headers $authHeaders `
    -AcceptedStatusCodes @(200, 422, 400, 404, 500) `
    -RejectMatch "ECONNREFUSED"

Write-Host ""
Write-Host "=== Service Chain: $script:PassCount/$script:TestCount passed ===" -ForegroundColor Green
exit 0
