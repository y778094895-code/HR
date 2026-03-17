# Smart HR System - Manual Verification Guide

This guide provides step-by-step instructions to verify the Smart HR Performance Management System following the latest architectural updates to a Microservices pattern, UI/UX redesign, and addition of automated smoke testing.

## Prerequisites

Before starting, ensure you have:
- ✅ Docker Desktop installed and running
- ✅ Node.js 18+ installed (for local development)
- ✅ Python 3.9+ installed (for ML service)
- ✅ Git Bash or PowerShell (for running scripts/commands)

---

## Step 1: Build Docker Images

The system has transitioned to a broader microservices architecture including an API Gateway, Consul, Redis, RabbitMQ, and an extensive monitoring stack (ELK, Prometheus, Grafana).

### Build All Services
```bash
docker-compose build
```

**Expected Output:**
- ✅ `smart_hr_gateway` image built successfully
- ✅ `smart_hr_employee-service` (Backend) built successfully
- ✅ `smart_hr_ml-service` built successfully 
- ✅ Infrastructure services (Postgres, Redis, RabbitMQ, Consul, Prometheus, Grafana, ElasticSearch, Kibana) downloaded/built.

---

## Step 2: Start Services

### Start all services in detached mode:
```bash
docker-compose up -d
```

### Check running containers:
```bash
docker-compose ps
```

**Expected Output (Service List):**
You should see all containers up and running, including:
- `gateway` (Port 8080)
- `employee-service` (Port 3000)
- `ml-service` (Port 8000)
- `postgres` (Port 5433 -> 5432)
- `redis` (Port 6379)
- `rabbitmq` (Ports 5672, 15672)
- `consul` (Port 8500)
- `prometheus` (Port 9090)
- `grafana` (Port 3002)
- `elasticsearch` (Port 9200)
- `kibana` (Port 5601)

*(Note: Frontend runs separately in dev environments via `npm run dev` on port 3001, or mounted through client distribution depending on your setup).*

---

## Step 3: Run Automated Smoke Tests

The project now includes an automated smoke testing framework to quickly verify the health and connectivity of the API Gateway and backend services.

**Run the Full Smoke Test:**
```bash
chmod +x scripts/smoke/full-smoke.sh
./scripts/smoke/full-smoke.sh
```

**Expected Results:**
- ✅ API Gateway Health (`/api/version`) -> OK
- ✅ Login via Gateway -> OK (Returns Token)
- ✅ Tests across 9+ Core Endpoints (`/api/dashboard/stats`, `/api/employees`, `/api/fairness/metrics`, etc.) -> OK (HTTP 200/201)

*If this script passes, your backend ecosystem is fully operational.*

---

## Step 4: Verify Frontend UI & Features

The User Interface underwent a massive redesign to support dynamic theming, layout restructuring, and a glass-morphism aesthetic.

### 4.1 Check Theming and Accents
1. Open the application at `http://localhost:3001`.
2. Login using `admin@smarthr.local` / `Admin@123`.
3. Navigate to **Settings > Appearance** (المظهر).
4. **Verify Themes:** Switch between `Light`, `Dark`, `Midnight`, and `Sand` themes. The UI should instantly adapt via CSS HTML `data-theme` attributes.
5. **Verify Accents:** Change the primary color accent (Blue, Green, Purple, Orange). Buttons and active states should immediately reflect this choice.

### 4.2 Check Structural Components
- **Dashboard Hub:** Navigate to Reports or Data Quality to view the new **Module Hub** architecture implementing `TabsContainer` for nested route navigation.
- **Profile Drawer:** Click on the User Profile dropdown in the Topbar and select "الملف الشخصي" to trigger the slide-out `ProfileActionDrawer`.

---

## Step 5: Advanced Component Verification

### 5.1 Monitoring Stack Check
- **Grafana:** Visit `http://localhost:3002` (Login: admin / admin). Verify data sources are wired up.
- **Prometheus:** Visit `http://localhost:9090`. Check targets to ensure `employee-service` and others are scraped.
- **Consul (Service Discovery):** Visit `http://localhost:8500`. Verify `gateway`, `employee-service`, and `ml-service` are registered.

### 5.2 Database & Migrations
The database schema includes new seed data linking departments and designations securely via Name mappings, resolving previous FK constraints. Tables are managed via Drizzle ORM/Raw SQL. 

To manually verify:
```bash
docker-compose exec postgres psql -U hr -d hr_system
```
Run `\dt` to see the 13+ standard tables. Verify seed data exists in `employees_local` and `departments`.

---

## Troubleshooting

### Issue: Gateway Returns 502/503
**Solution:** Consul service discovery might need a moment to register `employee-service`. Wait 30 seconds and retry. Check Consul UI at port 8500.

### Issue: SonarQube Workflow Errors
**Solution:** The CI/CD pipeline in `.github/workflows/sonarqube.yml` has been fixed to use v4/v5/v6 action versions. Ensure your GitHub repo has proper SonarCloud tokens if pushing code.

### Issue: Linting Errors in Server
**Solution:** Ensure ESLint is configured to parse TypeScript correctly using `@typescript-eslint/parser` and you have run `npm install` inside the `server/` directory.

---

## Success Criteria

✅ **All 10+ Docker containers running**  
✅ **Full Smoke Test (`full-smoke.sh`) passes with 0 failures**  
✅ **Frontend loads with new Dark/Light/Midnight themes working**  
✅ **Profile Drawer & Dashboard navigation functioning without flickering**  
✅ **Monitoring (Grafana/Prometheus) accessible**  

**Once all items are verified, the latest Smart HR System architecture is fully operational! 🎉**