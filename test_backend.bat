@echo off
REM Local testing script for Windows
setlocal enabledelayedexpansion

echo.
echo 🧪 Voter-Ready Backend Test Suite
echo ==================================
echo.

set API_KEY=test-api-key-12345678901234567890
set BASE_URL=http://localhost:8000

echo 1️⃣  Testing Eligibility Endpoint...
curl -X POST %BASE_URL%/api/eligibility/check ^
  -H "Content-Type: application/json" ^
  -H "X-API-Key: %API_KEY%" ^
  -d "{"age": 21, "isCitizen": true, "state": "Maharashtra", "residenceDuration": "6months+", "hasVoterId": false}"

echo.
echo 2️⃣  Testing Journey Endpoint...
curl "%BASE_URL%/api/journey/step/1?state=Maharashtra" ^
  -H "X-API-Key: %API_KEY%"

echo.
echo 3️⃣  Testing Chat Endpoint...
curl -X POST %BASE_URL%/api/chat/ ^
  -H "Content-Type: application/json" ^
  -H "X-API-Key: %API_KEY%" ^
  -d "{"message": "How do I register to vote?"}"

echo.
echo ✅ All tests completed!
