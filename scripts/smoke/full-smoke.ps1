# ============================================================
# full-smoke.ps1
# Smart HR System - Full Smoke Test Script
# Usage: .\scripts\smoke\full-smoke.ps1
# ============================================================

# ── Helper: perform an HTTP request and return the status code ────────────────
function Get-HttpStatus {
    param([string]$Url, [hashtable]$Headers = @{})
    try {
        $req = [System.Net.HttpWebRequest]::Create($Url)
        $req.Method  = "GET"
        $req.Timeout = 10000
        foreach ($key in $Headers.Keys) { $req.Headers[$key] = $Headers[$key] }
        $resp = $req.GetResponse()
        $code = [int]$resp.StatusCode
        $resp.Close()
        return $code
    } catch [System.Net.WebException] {
        if ($_.Exception.Response) {
            return [int]$_.Exception.Response.StatusCode
        }
        return 0
    }
}

Write-Host "Starting Full Smoke Test..." -ForegroundColor Yellow

# ── Step 1: Start services in detached mode ───────────────────────────────────
Write-Host "Bringing up docker compose environment..."
docker-compose up -d

# Give services a moment to initialize
Write-Host "Waiting for services to initialize (10s)..."
Start-Sleep -Seconds 10

# ── Step 2: Check Gateway health ──────────────────────────────────────────────
Write-Host -NoNewline "Checking API Gateway Health (/api/version)... "
$GW_HEALTH = Get-HttpStatus -Url "http://localhost:8080/api/version"

if ($GW_HEALTH -eq 200) {
    Write-Host "OK" -ForegroundColor Green
} else {
    Write-Host "FAILED (HTTP $GW_HEALTH)" -ForegroundColor Red
    Write-Host "Check: docker-compose logs gateway"
    exit 1
}

# ── Step 3: Login to obtain Bearer token ─────────────────────────────────────
Write-Host -NoNewline "Attempting to login via Gateway (/api/auth/login)... "

$body = '{"email":"admin@smarthr.local","password":"Admin@123"}'
$LOGIN_RESP = curl.exe -s -X POST http://localhost:8080/api/auth/login `
    -H "Content-Type: application/json" `
    -d $body

# Parse token — prefer native JSON, fall back to regex
try {
    $TOKEN = ($LOGIN_RESP | ConvertFrom-Json).access_token
} catch {
    # Fallback regex if response is not clean JSON
    if ($LOGIN_RESP -match '"access_token"\s*:\s*"([^"]+)"') {
        $TOKEN = $Matches[1]
    } else {
        $TOKEN = $null
    }
}

if ($TOKEN) {
    Write-Host "OK" -ForegroundColor Green
} else {
    Write-Host "FAILED" -ForegroundColor Red
    Write-Host "Response was: $LOGIN_RESP"
    exit 1
}

# ── Step 4: Check protected endpoints ────────────────────────────────────────
$endpoints = @(
    "/api/dashboard/stats",
    "/api/employees",
    "/api/fairness/metrics",
    "/api/interventions",
    "/api/turnover/metrics",
    "/api/training/recommendations",
    "/api/performance/overview",
    "/api/impact/overview",
    "/api/users"
)

$FAILS = 0

foreach ($endpoint in $endpoints) {
    Write-Host -NoNewline "Checking $endpoint ... "

    $HTTP_CODE = Get-HttpStatus `
        -Url "http://localhost:8080$endpoint" `
        -Headers @{ "Authorization" = "Bearer $TOKEN" }

    if ($HTTP_CODE -eq 200 -or $HTTP_CODE -eq 201) {
        Write-Host "OK (HTTP $HTTP_CODE)" -ForegroundColor Green
    } else {
        Write-Host "FAILED (HTTP $HTTP_CODE)" -ForegroundColor Red
        $FAILS++
    }
}

# ── Step 5: Conclusion ────────────────────────────────────────────────────────
Write-Host "=============================================================================="
if ($FAILS -eq 0) {
    Write-Host "All smoke tests passed successfully!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "$FAILS endpoint(s) failed. Please check logs." -ForegroundColor Red
    exit 1
}
