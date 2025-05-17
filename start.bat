@echo off
rem Promptner startup script for Windows

setlocal enabledelayedexpansion

set "LOGFILE=startup.log"
echo Starting Promptner at %date% %time% > %LOGFILE%

echo Checking port availability...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    echo Killing process on port 3001 (PID: %%a) >> %LOGFILE%
    taskkill /F /PID %%a > nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5001') do (
    echo Killing process on port 5001 (PID: %%a) >> %LOGFILE%
    taskkill /F /PID %%a > nul 2>&1
)

rem Install backend dependencies if needed
if not exist backend\node_modules (
    echo Installing backend dependencies... >> %LOGFILE%
    pushd backend
    npm install >> ..\%LOGFILE% 2>&1
    if errorlevel 1 (
        echo Failed to install backend dependencies. Check %LOGFILE% for details.
        popd
        pause
        exit /b 1
    )
    popd
)

rem Install frontend dependencies if needed
if not exist frontend\node_modules (
    echo Installing frontend dependencies... >> %LOGFILE%
    pushd frontend
    npm install >> ..\%LOGFILE% 2>&1
    if errorlevel 1 (
        echo Failed to install frontend dependencies. Check %LOGFILE% for details.
        popd
        pause
        exit /b 1
    )
    popd
)

start "Promptner Backend" cmd /k "cd backend && npm start"
timeout /t 5 > nul
start "Promptner Frontend" cmd /k "cd frontend && npm start"

echo Servers are starting. Please wait...
echo Frontend: http://localhost:3001
echo Backend:  http://localhost:5001
echo Check %LOGFILE% for detailed logs.

pause
