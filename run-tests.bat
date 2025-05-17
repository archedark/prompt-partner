@echo off
echo Running all tests and saving output to test-output.txt

echo === FRONTEND TESTS === > test-output.txt
cd frontend
call npm test -- --watchAll=false --no-watch >> ../test-output.txt 2>&1
cd ..

echo. >> test-output.txt
echo. >> test-output.txt
echo === BACKEND TESTS === >> test-output.txt
cd backend
call npm test -- --watchAll=false >> ../test-output.txt 2>&1
cd ..

echo.
echo Tests completed. Results saved to test-output.txt
echo.

REM Optionally display a summary of test results
echo Test Summary:
echo -------------
findstr /C:"PASS" /C:"FAIL" test-output.txt
echo.
echo For complete details, check test-output.txt 