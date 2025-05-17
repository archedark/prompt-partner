@echo off
rem Run all tests and save output to test-output.txt

echo === FRONTEND TESTS === > test-output.txt
cd frontend
call npm test -- --watchAll=false --no-watch >> ..\test-output.txt 2>&1
cd ..

echo. >> test-output.txt
echo === BACKEND TESTS === >> test-output.txt
cd backend
call npm test -- --watchAll=false >> ..\test-output.txt 2>&1
cd ..

echo.
echo Tests completed. Results saved to test-output.txt
echo.

echo Test Summary:
echo -------------
findstr /C:"PASS" /C:"FAIL" test-output.txt
echo.
echo For complete details, check test-output.txt
