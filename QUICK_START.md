# Smart HR System - Quick Start Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Verify Prerequisites
```bash
# Check Docker is installed and running
docker --version
docker-compose --version

# Check if Docker daemon is running
docker ps
```

### Step 2: Build and Start
```bash
# Navigate to project directory
cd d:\مشروع\16Yn-2026\smart_performance_system

# Build all services (this may take 5-10 minutes first time)
docker-compose build

# Start all services
docker-compose up -d

# Wait 30 seconds for services to initialize
timeout /t 30
```

### Step 3: Verify Services Are Running
```bash
# Check all containers are up
docker-compose ps

# Expected output: All services should show "Up" status
```

### Step 4: Test Health Endpoints

**Option A: Using PowerShell**
```powershell
# Test API Gateway (Main entrypoint)
Invoke-RestMethod -Uri "http://localhost:8080/api/version"

# Test Backend Service directly
Invoke-RestMethod -Uri "http://localhost:3000/api/health"

# Test ML Service directly
Invoke-RestMethod -Uri "http://localhost:8000/health"

# Test Frontend (open in browser)
Start-Process "http://localhost:3001"
```

**Option B: Using curl**
```bash
curl http://localhost:8080/api/version
curl http://localhost:3000/api/health
```

### Step 5: Test Authentication
> ⚠️ **DEVELOPMENT ONLY WARNING**: The system comes pre-seeded with default credentials. Make sure to change these in a production environment.

```powershell
# Login as admin via Gateway
$body = @{
    email = "admin@smarthr.local" # <== Updated Seed Acc
    password = "Admin@123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body

# Save the token
$token = $response.data.access_token # <== Now wrapped in standard ApiResponse format "data.access_token"
Write-Host "Token: $token"

# Test protected endpoint via Gateway
Invoke-RestMethod -Uri "http://localhost:8080/api/users" `
    -Headers @{Authorization = "Bearer $token"}
```

---

## ✅ Success Indicators

You'll know everything is working when:

1. **All 7 containers are running:**
   - smart_hr_postgres
   - smart_hr_redis
   - smart_hr_backend
   - smart_hr_ml_service
   - smart_hr_frontend
   - smart_hr_nginx
   - smart_hr_prometheus (optional)
   - smart_hr_grafana (optional)

2. **Health checks return 200 OK:**
   - http://localhost:3000/api/health
   - http://localhost:8000/health

3. **Frontend loads:**
   - http://localhost:3001

4. **Login works:**
   - Returns JWT token
   - Token can access protected endpoints

---

## 🔧 Common Issues and Solutions

### Issue: "Cannot connect to Docker daemon"
**Solution:**
- Start Docker Desktop
- Wait for it to fully initialize
- Try again

### Issue: "Port already in use"
**Solution:**
```bash
# Find what's using the port (example for port 3000)
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or change the port in .env file
```

### Issue: "Build failed"
**Solution:**
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

### Issue: "Service unhealthy"
**Solution:**
```bash
# Check logs for the specific service
docker-compose logs backend
docker-compose logs ml-service

# Restart the service
docker-compose restart backend
```

---

## 📊 Monitoring

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f ml-service
```

### Access Monitoring Tools
- **Prometheus:** http://localhost:9090
- **Grafana:** http://localhost:3002 (admin/admin)

---

## 🛑 Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

---

## 📝 Next Steps

Once everything is running:

1. **Explore the API:**
   - Swagger docs (if enabled): http://localhost:3000/api/docs
   - Gateway check: http://localhost:8080/api/version

2. **Access the Frontend:**
   - Main app: http://localhost:3001
   - Login with: `admin@smarthr.local` / `Admin@123`

3. **Test ML Predictions:**
   ```bash
   # We leverage the API Gateway BFF layer rather than calling ML blindly!
   curl -X POST http://localhost:8080/api/ml/predictions/turnover \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <TOKEN_HERE>" \
     -d '{"employee_id":"00000000-0000-0000-0000-000000000000","features":{}}'
   ```

4. **Check Database:**
   ```bash
   docker-compose exec postgres psql -U smart_hr_user -d smart_hr_db
   \dt
   ```

---

## 🎯 Verification Checklist

- [ ] Docker Desktop is running
- [ ] All containers show "Up" status
- [ ] Backend health check returns 200
- [ ] ML service health check returns 200
- [ ] Frontend loads in browser
- [ ] Login returns JWT token
- [ ] Protected endpoints work with token
- [ ] Database has 13 tables
- [ ] No error logs in docker-compose logs

**When all items are checked, your system is fully operational! 🎉**
