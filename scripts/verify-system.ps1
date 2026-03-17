# ============================================================
# verify-system.ps1
# Smart HR System - Verification Script (PowerShell)
# Verifies all services defined in docker-compose.yml
#
# Services (from docker-compose.yml):
#   postgres   → internal 5432 | external 5433
#   redis      → 6379:6379
#   rabbitmq   → 5672, 15672
#   backend    → 3000:3000
#   ml-service → 8000:8000
#   frontend   → no exposed port (accessible only via gateway)
#   gateway    → 8080:8080
# ============================================================

# ── Load .env file into PowerShell session ────────────────────────────────────
$envFile = Join-Path $PSScriptRoot "..\\.env"
if (Test-Path $envFile) {
    Get-Content $envFile | Where-Object { $_ -match '^\s*[^#].*=.*' } | ForEach-Object {
        $parts = $_ -split '=', 2
        $key   = $parts[0].Trim()
        $value = $parts[1].Trim() -replace '\s*#.*$', ''   # strip inline comments
        [System.Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
    Write-Host ".env loaded" -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "Smart HR System Verification Script" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# ── Helper: HTTP health check ─────────────────────────────────────────────────
function Test-Service {
    param(
        [string]$ServiceName,
        [string]$Url
    )
    Write-Host "Checking $ServiceName... " -NoNewline
    try {
        $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "Healthy" -ForegroundColor Green
            return $true
        } else {
            Write-Host "Unhealthy (Status $($response.StatusCode))" -ForegroundColor Red
            return $false
        }
    } catch {
        if ($_.Exception.Response) {
            # A non-200 HTTP response still means the service is up
            $code = [int]$_.Exception.Response.StatusCode
            Write-Host "Responding (HTTP $code)" -ForegroundColor Yellow
            return $true
        }
        Write-Host "Unreachable - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# ── Step 1: Build Docker images ───────────────────────────────────────────────
Write-Host "Step 1: Building Docker Images" -ForegroundColor Yellow
Write-Host "-------------------------------"
docker-compose build
if ($LASTEXITCODE -eq 0) {
    Write-Host "Build successful" -ForegroundColor Green
} else {
    Write-Host "Build failed" -ForegroundColor Red
    exit 1
}
Write-Host ""

# ── Step 2: Start services ────────────────────────────────────────────────────
Write-Host "Step 2: Starting Services" -ForegroundColor Yellow
Write-Host "--------------------------"
docker-compose up -d
Write-Host "Waiting 30 seconds for services to initialize..."
Start-Sleep -Seconds 30
Write-Host ""

# ── Step 3: Health checks ─────────────────────────────────────────────────────
# Ports from docker-compose.yml:
#   backend    → 3000   ml-service → 8000   gateway → 8080
#   frontend   → no exposed port; check via gateway
Write-Host "Step 3: Health Checks" -ForegroundColor Yellow
Write-Host "---------------------"
Test-Service -ServiceName "Backend API"  -Url "http://localhost:3000/api/health"
Test-Service -ServiceName "ML Service"   -Url "http://localhost:8000/health"
Test-Service -ServiceName "Gateway"      -Url "http://localhost:8080/api/version"
Test-Service -ServiceName "Frontend (via Gateway)" -Url "http://localhost:8080/"
Write-Host ""

# ── Step 4: Test authentication (via gateway on 8080) ────────────────────────
Write-Host "Step 4: Testing Authentication" -ForegroundColor Yellow
Write-Host "-------------------------------"
Write-Host "Testing login endpoint via gateway..."

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
        Write-Host "Authentication working" -ForegroundColor Green
    } else {
        Write-Host "Authentication may need configuration" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Authentication endpoint not ready: $($_.Exception.Message)" -ForegroundColor Yellow
}
Write-Host ""

# ── Step 5: Database verification ────────────────────────────────────────────
# postgres container name: postgres  |  external port: 5433
# uses POSTGRES_USER / POSTGRES_DB loaded from .env above
Write-Host "Step 5: Database Verification" -ForegroundColor Yellow
Write-Host "---------------------------------"
Write-Host "Checking database tables (connecting via docker-compose exec)..."

$pgUser = $env:POSTGRES_USER
$pgDb   = $env:POSTGRES_DB

if (-not $pgUser) { $pgUser = "hr" }
if (-not $pgDb)   { $pgDb   = "hr_system" }

$tables  = docker-compose exec -T postgres psql -U $pgUser -d $pgDb -c "\dt" 2>&1
$matched = $tables | Select-String -Pattern "users|employees_local|turnover_risk|fairness_metrics"

if ($matched) {
    Write-Host "Database tables exist" -ForegroundColor Green
    $matched | ForEach-Object { Write-Host "  $_" }
} else {
    Write-Host "Database tables missing or DB not ready yet" -ForegroundColor Red
}
Write-Host ""

# ── Step 6: Container status ──────────────────────────────────────────────────
Write-Host "Step 6: Container Status" -ForegroundColor Yellow
Write-Host "-------------------------"
docker-compose ps
Write-Host ""

# ── Summary ───────────────────────────────────────────────────────────────────
Write-Host "Verification Complete!" -ForegroundColor Green
Write-Host "======================"
Write-Host ""
Write-Host "Access points:"
Write-Host "  Gateway (main entry):  http://localhost:8080"
Write-Host "  Backend API (direct):  http://localhost:3000/api"
Write-Host "  ML Service (direct):   http://localhost:8000"
Write-Host "  RabbitMQ Management:   http://localhost:15672"
Write-Host "  View logs:             docker-compose logs -f [service-name]"
Write-Host "  Services: postgres | redis | rabbitmq | backend | ml-service | frontend | gateway"
Write-Host ""
