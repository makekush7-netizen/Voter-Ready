#!/bin/bash
# Local testing script

echo "🧪 Voter-Ready Backend Test Suite"
echo "=================================="

API_KEY="test-api-key-12345678901234567890"
BASE_URL="http://localhost:8000"

echo ""
echo "1️⃣  Testing Eligibility Endpoint..."
curl -X POST $BASE_URL/api/eligibility/check \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "age": 21,
    "isCitizen": true,
    "state": "Maharashtra",
    "residenceDuration": "6months+",
    "hasVoterId": false
  }' \
  -s | python -m json.tool

echo ""
echo "2️⃣  Testing Journey Endpoint..."
curl "$BASE_URL/api/journey/step/1?state=Maharashtra" \
  -H "X-API-Key: $API_KEY" \
  -s | python -m json.tool

echo ""
echo "3️⃣  Testing Chat Endpoint..."
curl -X POST $BASE_URL/api/chat/ \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{"message": "How do I register to vote?"}' \
  -s | python -m json.tool

echo ""
echo "✅ All tests completed!"
