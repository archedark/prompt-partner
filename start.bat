@echo off
title Prompt Partner Startup Script

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Function to check if a port is in use
setlocal enabledelayedexpansion
set FRONTEND_PORT=3001
set BACKEND_PORT=5001

:: Check if ports are already in use
netstat -ano | findstr ":%FRONTEND_PORT% .*LISTENING" >nul
if !ERRORLEVEL! EQU 0 (
    echo Frontend port %FRONTEND_PORT% is already in use.
    echo Please stop any running instances before starting new ones.
    echo You can use: taskkill /F /PID [PID] to stop a specific process
    echo.
    netstat -ano | findstr ":%FRONTEND_PORT% .*LISTENING"
    pause
    exit /b 1
)

netstat -ano | findstr ":%BACKEND_PORT% .*LISTENING" >nul
if !ERRORLEVEL! EQU 0 (
    echo Backend port %BACKEND_PORT% is already in use.
    echo Please stop any running instances before starting new ones.
    echo You can use: taskkill /F /PID [PID] to stop a specific process
    echo.
    netstat -ano | findstr ":%BACKEND_PORT% .*LISTENING"
    pause
    exit /b 1
)

:: Check for required .env files
if not exist "backend\.env" (
    echo Error: backend\.env file is missing
    echo Please create the file with required configuration
    pause
    exit /b 1
)

if not exist "frontend\.env" (
    echo Error: frontend\.env file is missing
    echo Please create the file with required configuration
    pause
    exit /b 1
)

echo Starting Prompt Partner servers...
echo.

:: Start backend server in a new window
start "Prompt Partner Backend" cmd /k "cd backend && echo Installing backend dependencies... && npm install && echo Starting backend server... && npm start"

:: Wait a moment for backend to start
timeout /t 5 /nobreak

:: Start frontend server in a new window
start "Prompt Partner Frontend" cmd /k "cd frontend && echo Installing frontend dependencies... && npm install && echo Starting frontend server... && npm start"

echo.
echo Servers are starting in separate windows...
echo.
echo Frontend will be available at: http://localhost:%FRONTEND_PORT%
echo Backend will be available at: http://localhost:%BACKEND_PORT%
echo.
echo Press any key to exit this window (servers will continue running)
pause >nul 