# 02-auth.ps1 — Authentication flow verification
# Purpose: Confirm JWT auth enforcement, login, and token hydration
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
        [int]$ExpectedStatusCode = 200,
        [string]$ExpectedMatch = ""
    )

    $script:TestCount++
    Write-Host "  [$script:TestCount] $Name... " -NoNewline

    $statusCode = 0
    $content = ""

    try {
        $params = @{
            Uri            = $Url
            Method         = $Method
            Headers        = $Headers
            UseBasicParsing = $true
            TimeoutSec     = 10
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
    return $content
}

Write-Host ""
Write-Host "=== Category 2: Auth Flow Tests ===" -ForegroundColor Cyan
Write-Host ""

# A1: Missing token rejection
# Purpose: Confirm protected endpoints reject unauthenticated requests
# Input: GET :8080/api/auth/me (no Authorization header)
# Expected: 401
# Failure: Auth middleware not enforcing
Test-Endpoint -Name "A1 Missing token rejection" `
    -Url "http://localhost:8080/api/auth/me" `
    -ExpectedStatusCode 401

# A2: Invalid JWT rejection
# Purpose: Confirm gateway rejects forged/malformed tokens
# Input: GET :8080/api/auth/me with Bearer invalid.jwt.here
# Expected: 401
# Failure: JWT validation broken
Test-Endpoint -Name "A2 Invalid JWT rejection" `
    -Url "http://localhost:8080/api/auth/me" `
    -Headers @{ "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature" } `
    -ExpectedStatusCode 401

# A3: Login success
# Purpose: Confirm credential-based token issuance
# Input: POST :8080/auth/login with valid credentials
# Expected: 200, body contains "access_token"
# Failure: Auth service or DB seeding broken
$loginBody = '{"email":"admin@smart-hr.com","password":"Admin@123"}'
$loginResponse = Test-Endpoint -Name "A3 Login success" `
    -Url "http://localhost:8080/api/auth/login" `
    -Method "Post" `
    -Body $loginBody `
    -ExpectedStatusCode 200 `
    -ExpectedMatch "access_token"

# Parse token for A4
$tokenData = $loginResponse | ConvertFrom-Json
if (-not $tokenData.data.access_token) {
    Write-Host "  FATAL: Could not parse access_token from login response" -ForegroundColor Red
    exit 1
}
$token = $tokenData.data.access_token

# A4: Token hydration (/me)
# Purpose: Confirm a freshly-issued token is accepted and returns user identity
# Input: GET :8080/api/auth/me with Bearer <token from A3>
# Expected: 200, body contains "admin@smart-hr.com"
# Failure: Token signing/verification mismatch, or /me handler broken
Test-Endpoint -Name "A4 Token hydration (me)" `
    -Url "http://localhost:8080/api/auth/me" `
    -Headers @{ "Authorization" = "Bearer $token" } `
    -ExpectedStatusCode 200 `
    -ExpectedMatch "admin@smart-hr.com"

Write-Host ""
Write-Host "=== Auth: $script:PassCount/$script:TestCount passed ===" -ForegroundColor Green
exit 0
