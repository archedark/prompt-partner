#!/bin/bash

set -e

echo "Running all tests and saving output to test-output.txt"

echo "=== FRONTEND TESTS ===" > test-output.txt
(
  cd frontend
  npm test -- --watchAll=false --no-watch
) >> ../test-output.txt 2>&1

printf '\n\n=== BACKEND TESTS ===\n' >> test-output.txt
(
  cd backend
  npm test -- --watchAll=false
) >> ../test-output.txt 2>&1

echo -e "\nTests completed. Results saved to test-output.txt\n"

echo "Test Summary:"
echo "-------------"
grep -E "PASS|FAIL" test-output.txt
echo -e "\nFor complete details, check test-output.txt"
