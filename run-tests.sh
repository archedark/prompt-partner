#!/bin/bash

echo "Running all tests and saving output to test-output.txt"

# Run frontend tests
echo "=== FRONTEND TESTS ===" > test-output.txt
cd frontend
npm test -- --watchAll=false --no-watch >> ../test-output.txt 2>&1
cd ..

# Add spacing between test sections
echo -e "\n\n=== BACKEND TESTS ===" >> test-output.txt

# Run backend tests
cd backend
npm test -- --watchAll=false >> ../test-output.txt 2>&1
cd ..

echo -e "\nTests completed. Results saved to test-output.txt\n"

# Optionally display a summary of test results
echo "Test Summary:"
echo "-------------"
grep -E "PASS|FAIL" test-output.txt
echo -e "\nFor complete details, check test-output.txt" 