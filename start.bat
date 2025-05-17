@echo off
title Promptner Startup Script

setlocal enabledelayedexpansion

:: Create a log file
set "LOGFILE=startup.log"
echo Starting Promptner at %date% %time% > %LOGFILE%

:: Check and clear ports if needed
echo Checking port availability...

:: Clear port 3001 (frontend) if in use
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    echo Killing process on port 3001 (PID: %%a) >> %LOGFILE%
    taskkill /F /PID %%a > nul 2>&1
)

:: Clear port 5001 (backend) if in use
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5001') do (
    echo Killing process on port 5001 (PID: %%a) >> %LOGFILE%
    taskkill /F /PID %%a > nul 2>&1
)

echo Starting Promptner servers...

:: Start backend server
echo Starting backend server...
cd backend
if not exist node_modules (
    echo Installing backend dependencies... >> %LOGFILE%
    call npm install >> %LOGFILE% 2>&1
    if errorlevel 1 (
        echo Failed to install backend dependencies. Check %LOGFILE% for details.
        cd ..
        pause
        exit /b 1
    )
)

if %FRONTEND_DEPS_NEEDED%==1 (
    echo Installing frontend dependencies...
    cd frontend
    call npm ci --no-audit --no-fund >> %LOGFILE% 2>&1
    if errorlevel 1 (
        echo Failed to install frontend dependencies. Check %LOGFILE% for details.
        cd ..
        pause
        exit /b 1
    )
    cd ..
)

:: Start both servers in parallel
echo Starting backend and frontend servers...

:: Start backend server
cd backend
start "Promptner Backend" cmd /k "npm start >> %LOGFILE% 2>&1"
cd ..

:: Start frontend server (no need to wait)
cd frontend
if not exist node_modules (
    echo Installing frontend dependencies... >> %LOGFILE%
    call npm install >> %LOGFILE% 2>&1
    if errorlevel 1 (
        echo Failed to install frontend dependencies. Check %LOGFILE% for details.
        cd ..
        pause
        exit /b 1
    )
)
echo Starting frontend server... >> %LOGFILE%
start "Promptner Frontend" cmd /k "npm start >> %LOGFILE% 2>&1"
cd ..

echo Servers are starting. Please wait...
echo Frontend will be available at http://localhost:3001
echo Backend will be available at http://localhost:5001
echo Check %LOGFILE% for detailed logs if you encounter any issues.

:: Keep the window open
pause 