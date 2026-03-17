#!/bin/bash

# ==============================================================================
# Smart HR System - Full Smoke Test Script
# Usage: ./scripts/smoke/full-smoke.sh
# ==============================================================================

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting Full Smoke Test...${NC}"

# 1. Start services in detached mode
echo "Bringing up docker compose environment..."
docker-compose up -d

# Give services a moment to initialize
echo "Waiting for services to initialize (10s)..."
sleep 10

# 2. Check Gateway Health
echo -n "Checking API Gateway Health (/api/version)... "
GW_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/version)

if [ "$GW_HEALTH" -eq 200 ]; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}FAILED (HTTP $GW_HEALTH)${NC}"
    echo "Check docker logs api-gateway"
    exit 1
fi

# 3. Perform Login to obtain token
echo -n "Attempting to login via Gateway (/api/auth/login)... "
LOGIN_RESP=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@smarthr.local","password":"Admin@123"}')

TOKEN=$(echo $LOGIN_RESP | grep -oP '"access_token":"\K[^"]+')

if [ -n "$TOKEN" ]; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}FAILED${NC}"
    echo "Response was: $LOGIN_RESP"
    exit 1
fi

# 4. Check Protected Endpoints
endpoints=(
  "/api/dashboard/stats"
  "/api/employees"
  "/api/fairness/metrics"
  "/api/interventions"
  "/api/turnover/metrics"
  "/api/training/recommendations"
  "/api/performance/overview"
  "/api/impact/overview"
  "/api/users"
)

FAILS=0

for endpoint in "${endpoints[@]}"; do
    echo -n "Checking $endpoint ... "
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" http://localhost:8080$endpoint)
    
    if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 201 ]; then
        echo -e "${GREEN}OK (HTTP $HTTP_CODE)${NC}"
    else
        echo -e "${RED}FAILED (HTTP $HTTP_CODE)${NC}"
        FAILS=$((FAILS+1))
    fi
done

# 5. Conclusion
echo "=============================================================================="
if [ "$FAILS" -eq 0 ]; then
    echo -e "${GREEN}All smoke tests passed successfully!${NC}"
    exit 0
else
    echo -e "${RED}$FAILS endpoints failed. Please check logs.${NC}"
    exit 1
fi
