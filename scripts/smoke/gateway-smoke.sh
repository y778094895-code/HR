#!/bin/bash

GATEWAY_URL="http://localhost:3000/api"

echo "Testing Gateway Prefixes..."

PREFIXES="dashboard users turnover performance training reports impact recommendations employees fairness interventions"

ALL_PASSED=true

for prefix in $PREFIXES; do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$GATEWAY_URL/$prefix")
  
  if [ "$HTTP_CODE" == "404" ]; then
    echo "❌ $prefix: FAILED (Returned 404 Not Found)"
    ALL_PASSED=false
  else
    # Any status other than 404 means the gateway successfully routed it
    # (e.g. 401 Unauthorized is a success for gateway routing)
    echo "✅ $prefix: SUCCESS (Returned $HTTP_CODE)"
  fi
done

echo "Testing /api/version..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$GATEWAY_URL/version")
if [ "$HTTP_CODE" == "200" ]; then
  echo "✅ version: SUCCESS (Returned $HTTP_CODE)"
else
  echo "❌ version: FAILED (Returned $HTTP_CODE)"
  ALL_PASSED=false
fi

if [ "$ALL_PASSED" = true ]; then
  echo "-----------------------------------"
  echo "✅ All smoke tests passed (No 404s)!"
  exit 0
else
  echo "-----------------------------------"
  echo "❌ Some smoke tests failed (Returned 404)."
  exit 1
fi
