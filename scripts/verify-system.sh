#!/bin/bash
# Smart HR System - Verification Script
# This script verifies all services are working correctly

echo "🚀 Smart HR System Verification Script"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a service is healthy
check_service() {
    local service_name=$1
    local url=$2
    
    echo -n "Checking $service_name... "
    
    if curl -f -s -o /dev/null "$url"; then
        echo -e "${GREEN}✓ Healthy${NC}"
        return 0
    else
        echo -e "${RED}✗ Unhealthy${NC}"
        return 1
    fi
}

# Step 1: Build Docker images
echo "📦 Step 1: Building Docker Images"
echo "-----------------------------------"
docker-compose build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi
echo ""

# Step 2: Start services
echo "🔧 Step 2: Starting Services"
echo "----------------------------"
docker-compose up -d
echo "Waiting 30 seconds for services to initialize..."
sleep 30
echo ""

# Step 3: Check service health
echo "🏥 Step 3: Health Checks"
echo "------------------------"
check_service "PostgreSQL" "http://localhost:5432" || echo "Note: Direct HTTP check may not work for PostgreSQL"
check_service "Backend API" "http://localhost:3000/api/health"
check_service "ML Service" "http://localhost:8000/health"
check_service "Frontend" "http://localhost:3001"
echo ""

# Step 4: Test authentication
echo "🔐 Step 4: Testing Authentication"
echo "----------------------------------"
echo "Testing login endpoint..."
response=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@smart-hr.com","password":"Admin@123"}')

if echo "$response" | grep -q "access_token"; then
    echo -e "${GREEN}✓ Authentication working${NC}"
else
    echo -e "${YELLOW}⚠ Authentication may need configuration${NC}"
    echo "Response: $response"
fi
echo ""

# Step 5: Database verification
echo "💾 Step 5: Database Verification"
echo "---------------------------------"
echo "Checking database tables..."
docker-compose exec -T postgres psql -U smart_hr_user -d smart_hr_db -c "\dt" | grep -E "users|employees_local|turnover_risk|fairness_metrics"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database tables exist${NC}"
else
    echo -e "${RED}✗ Database tables missing${NC}"
fi
echo ""

# Step 6: Show running containers
echo "📊 Step 6: Container Status"
echo "----------------------------"
docker-compose ps
echo ""

# Summary
echo "✅ Verification Complete!"
echo "========================"
echo ""
echo "Next steps:"
echo "1. Access Frontend: http://localhost:3001"
echo "2. Access Backend API: http://localhost:3000/api"
echo "3. Access ML Service: http://localhost:8000"
echo "4. View logs: docker-compose logs -f [service-name]"
echo ""
